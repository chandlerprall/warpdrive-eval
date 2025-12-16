import { apiBaseURL } from 'ui/config/api';

/**
 * Eager Relationship Loader Handler
 *
 * A RequestManager handler that pre-fetches missing relationships and adds them
 * to the response's `included` array.
 *
 * PROBLEM THIS SOLVES:
 * WarpDrive's async relationship loading has incomplete implementation (see
 * validateBelongsToLinksMode in @warp-drive/json-api). Setting async: true with
 * links doesn't automatically fetch relationships when accessed.
 *
 * SOLUTION:
 * Instead of relying on async loading, we eagerly fetch all missing relationships
 * in parallel and add them to the response's `included` array. This gives us:
 * - Single request waterfall (all fetches in parallel)
 * - Cache-aware (only fetch what's not in cache)
 * - JSON:API compliant (uses standard `included` format)
 * - Immediate data availability (no loading states)
 *
 * FLOW:
 * 1. Runs before RelationshipLinksHandler (on response path)
 * 2. Extract all relationship identifiers from response
 * 3. Filter out resources already in `included`
 * 4. Deduplicate by type+id
 * 5. Fetch missing resources in parallel via direct fetch
 * 6. Add fetched resources to response's `included` array
 *
 * @example
 * // Before handler:
 * {
 *   data: {
 *     type: 'posts',
 *     id: '1',
 *     relationships: {
 *       author: { data: { type: 'users', id: '2' } }
 *     }
 *   }
 * }
 *
 * // After handler (if user #2 not in cache):
 * {
 *   data: { ... },
 *   included: [
 *     { type: 'users', id: '2', attributes: { ... } }
 *   ]
 * }
 */

/**
 * Extract all resource identifiers from a relationship object
 *
 * @param {Object} relationship - Relationship object with data/links/meta
 * @returns {Array<{type: string, id: string}>} Array of resource identifiers
 */
function extractIdentifiers(relationship) {
  if (!relationship || !relationship.data) {
    return [];
  }

  // belongs-to: single identifier
  if (relationship.data.type && relationship.data.id) {
    return [{ type: relationship.data.type, id: relationship.data.id }];
  }

  // has-many: array of identifiers
  if (Array.isArray(relationship.data)) {
    return relationship.data
      .filter(item => item.type && item.id)
      .map(item => ({ type: item.type, id: item.id }));
  }

  return [];
}

/**
 * Extract all relationship identifiers from a resource
 *
 * @param {Object} resource - JSON:API resource object
 * @returns {Array<{type: string, id: string}>} Array of resource identifiers
 */
function extractResourceIdentifiers(resource) {
  if (!resource || !resource.relationships) {
    return [];
  }

  const identifiers = [];
  for (const relationship of Object.values(resource.relationships)) {
    identifiers.push(...extractIdentifiers(relationship));
  }

  return identifiers;
}

/**
 * Extract all relationship identifiers from a JSON:API document
 *
 * @param {Object} document - JSON:API document with data/included
 * @returns {Array<{type: string, id: string}>} Array of unique resource identifiers
 */
function extractAllIdentifiers(document) {
  if (!document) {
    return [];
  }

  const identifiers = [];

  // Extract from primary data
  if (document.data) {
    if (Array.isArray(document.data)) {
      for (const resource of document.data) {
        identifiers.push(...extractResourceIdentifiers(resource));
      }
    } else {
      identifiers.push(...extractResourceIdentifiers(document.data));
    }
  }

  // Extract from included (relationships can have relationships!)
  if (document.included && Array.isArray(document.included)) {
    for (const resource of document.included) {
      identifiers.push(...extractResourceIdentifiers(resource));
    }
  }

  return identifiers;
}

/**
 * Check if a resource exists in the store's cache
 *
 * @param {Object} store - WarpDrive store instance
 * @param {string} type - Resource type
 * @param {string} id - Resource id
 * @returns {boolean} True if resource is in cache
 */
function isInCache(store, type, id) {
  try {
    // Use peekRecord to check cache without triggering a fetch
    const cached = store.peekRecord(type, id);
    return !!cached;
  } catch {
    // If type isn't registered or other error, assume not cached
    return false;
  }
}

/**
 * Deduplicate resource identifiers by type+id
 *
 * @param {Array<{type: string, id: string}>} identifiers - Array of identifiers
 * @returns {Array<{type: string, id: string}>} Deduplicated array
 */
function deduplicateIdentifiers(identifiers) {
  const seen = new Set();
  const unique = [];

  for (const identifier of identifiers) {
    const key = `${identifier.type}:${identifier.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(identifier);
    }
  }

  return unique;
}

/**
 * Create Eager Relationship Loader Handler
 *
 * Factory function that creates a handler with access to the store for cache checking.
 *
 * @param {Store} store - WarpDrive store instance for cache access
 * @returns {Object} Handler object with request method
 */
export function createEagerRelationshipLoader(store) {
  return {
    async request(context, next) {
      // Let the request proceed through the chain
      // At this point RelationshipLinksHandler has already injected links
      const response = await next(context.request);

      // Only process successful JSON:API responses
      if (!response || response.status >= 400) {
        return response;
      }

      // Only process if we have content
      if (!response.content || typeof response.content !== 'object') {
        return response;
      }

      // Check if this looks like JSON:API (has data with type/id)
      const hasJsonApiShape =
        response.content.data &&
        (
          (response.content.data.type && response.content.data.id) ||
          (Array.isArray(response.content.data) &&
           response.content.data.length > 0 &&
           response.content.data[0].type)
        );

      if (!hasJsonApiShape) {
        return response;
      }

      // Extract all relationship identifiers
      const allIdentifiers = extractAllIdentifiers(response.content);

      if (allIdentifiers.length === 0) {
        return response;
      }

      // Deduplicate identifiers
      const uniqueIdentifiers = deduplicateIdentifiers(allIdentifiers);

      // Filter out resources already in included array
      const existingInIncluded = new Set();
      if (response.content.included && Array.isArray(response.content.included)) {
        for (const resource of response.content.included) {
          existingInIncluded.add(`${resource.type}:${resource.id}`);
        }
      }

      // Filter out resources already in cache
      const toFetch = uniqueIdentifiers.filter(({ type, id }) => {
        // Skip if already in included
        if (existingInIncluded.has(`${type}:${id}`)) {
          return false;
        }

        // Check if in cache
        if (isInCache(store, type, id)) {
          console.log(`[EagerRelationshipLoader] Skipping ${type}:${id} (already in cache)`);
          return false;
        }

        return true;
      });

    if (toFetch.length === 0) {
      return response;
    }

    // Fetch all missing resources in parallel using direct fetch
    // We bypass the handler chain to avoid recursion and keep it simple
    const fetchPromises = toFetch.map(async ({ type, id }) => {
      try {
        // Construct the full URL using configured API base
        const resourceUrl = `${apiBaseURL}/${type}/${id}`;

        const fetchResponse = await fetch(resourceUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        });

        if (!fetchResponse.ok) {
          console.warn(`[EagerRelationshipLoader] HTTP ${fetchResponse.status} for ${type}:${id}`);
          return null;
        }

        const json = await fetchResponse.json();

        if (json.data) {
          return json.data;
        }

        return null;
      } catch (error) {
        console.warn(`[EagerRelationshipLoader] Failed to fetch ${type}:${id}`, error);
        return null;
      }
    });

    // Wait for all fetches to complete
    const fetchedResources = await Promise.all(fetchPromises);

    // Filter out nulls (failed fetches) and add to included
    const validResources = fetchedResources.filter(r => r !== null);

    if (validResources.length > 0) {
      const included = response.content.included || [];

      console.log(`[EagerRelationshipLoader] Pre-fetched ${validResources.length} relationships`, {
        fetched: validResources.map(r => `${r.type}:${r.id}`)
      });

      return {
        ...response,
        content: {
          ...response.content,
          included: [...included, ...validResources]
        }
      };
    }

    return response;
    }
  };
}

