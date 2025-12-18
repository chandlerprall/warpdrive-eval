/**
 * Relationship Links Handler
 *
 * A RequestManager handler that injects JSON:API relationship links into responses.
 *
 * LEARNING GOAL:
 * This handler simulates receiving a fully JSON:API-compliant response with relationship
 * links, even when the upstream API doesn't provide them. This enables us to explore
 * WarpDrive's async relationship loading without requiring server changes.
 *
 * WHAT IT DOES:
 * - Intercepts responses after fetch
 * - Finds relationships in resource data
 * - Injects `links.related` for each relationship based on type/id
 * - Passes enhanced response to next handler (cache)
 *
 * PATTERN:
 * This demonstrates the "data transformation middleware" pattern in RequestManager.
 * Handlers can modify request/response data to normalize different API formats.
 *
 * @example
 * // Before handler:
 * {
 *   data: {
 *     type: 'posts',
 *     id: '1',
 *     relationships: {
 *       author: {
 *         data: { type: 'users', id: '2' }
 *       }
 *     }
 *   }
 * }
 *
 * // After handler:
 * {
 *   data: {
 *     type: 'posts',
 *     id: '1',
 *     relationships: {
 *       author: {
 *         data: { type: 'users', id: '2' },
 *         links: {
 *           related: 'http://localhost:3000/api/users/2'
 *         }
 *       }
 *     }
 *   }
 * }
 */

import { apiBaseURL } from 'ui/config/api';

/**
 * Inject links into a single relationship object
 *
 * @param {Object} relationship - The relationship object (with data, links, meta)
 * @returns {Object} Enhanced relationship with links
 */
function injectRelationshipLinks(relationship) {
  // Skip if no data or already has links
  if (!relationship.data || relationship.links) {
    return relationship;
  }

  // Handle belongs-to (single resource identifier)
  if (relationship.data.type && relationship.data.id) {
    return {
      ...relationship,
      links: {
        related: `${apiBaseURL}/${relationship.data.type}/${relationship.data.id}`
      }
    };
  }

  // Handle has-many (array of resource identifiers)
  if (Array.isArray(relationship.data) && relationship.data.length > 0) {
    // For collections, we can't create a single URL for all resources
    // JSON:API allows omitting links for collections if they're included inline
    // WarpDrive will use the data identifiers directly
    // But we could point to a collection endpoint if we had one
    // For now, we'll leave has-many without links since the data is included
    return relationship;
  }

  return relationship;
}

/**
 * Inject links into all relationships in a resource
 *
 * @param {Object} resource - A JSON:API resource object
 * @returns {Object} Enhanced resource with relationship links
 */
function injectResourceLinks(resource) {
  if (!resource || !resource.relationships) {
    return resource;
  }

  const enhancedRelationships = {};

  for (const [name, relationship] of Object.entries(resource.relationships)) {
    enhancedRelationships[name] = injectRelationshipLinks(relationship);
  }

  return {
    ...resource,
    relationships: enhancedRelationships
  };
}

/**
 * Process a JSON:API document and inject relationship links
 *
 * @param {Object} document - JSON:API document (with data, included, etc.)
 * @returns {Object} Enhanced document with relationship links
 */
function injectDocumentLinks(document) {
  if (!document) {
    return document;
  }

  const enhanced = { ...document };

  // Process primary data
  if (enhanced.data) {
    if (Array.isArray(enhanced.data)) {
      enhanced.data = enhanced.data.map(injectResourceLinks);
    } else {
      enhanced.data = injectResourceLinks(enhanced.data);
    }
  }

  // Process included resources
  if (enhanced.included && Array.isArray(enhanced.included)) {
    enhanced.included = enhanced.included.map(injectResourceLinks);
  }

  return enhanced;
}

/**
 * Relationship Links Handler
 *
 * RequestManager handler that injects relationship links into JSON:API responses.
 */
export const RelationshipLinksHandler = {
  async request(context, next) {
    // Let the request proceed through the chain (fetch, etc.)
    const response = await next(context.request);

    // Only process successful JSON:API responses
    if (!response || response.status >= 400) {
      return response;
    }

    // Only process if we have content to modify
    if (!response.content || typeof response.content !== 'object') {
      return response;
    }

    // Check if this is a JSON:API response by shape (data object with type & id)
    // This is more reliable than content-type header which our API doesn't set correctly
    const hasJsonApiShape =
      response.content.data &&
      (
        // Single resource: { data: { type, id, ... } }
        (response.content.data.type && response.content.data.id) ||
        // Collection: { data: [{ type, id, ... }, ...] }
        (Array.isArray(response.content.data) &&
         response.content.data.length > 0 &&
         response.content.data[0].type &&
         response.content.data[0].id)
      );

    if (!hasJsonApiShape) {
      return response;
    }

    // Inject links into the response content
    const enhancedContent = injectDocumentLinks(response.content);

    // Log what we did (for learning)
    if (enhancedContent !== response.content) {
      console.log('[RelationshipLinksHandler] Injected relationship links into response', structuredClone({
        url: context.request.url,
        enhancedContent
      }));
    }

    // Return response with enhanced content
    return {
      ...response,
      content: enhancedContent
    };
  }
};

