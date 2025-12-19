import { useRecommendedStore } from '@warp-drive/core';
import { JSONAPICache } from '@warp-drive/json-api';
import { BaseURLHandler, LoggingHandler } from 'ui/utils/request-manager';
import { RelationshipLinksHandler } from 'ui/handlers/relationship-links';
import { registerPostSchema } from 'ui/models/post';
import { registerUserSchema } from 'ui/models/user';
import { registerCategorySchema } from 'ui/models/category';
import { registerTagSchema } from 'ui/models/tag';

/**
 * Application Store Service (useLegacyStore Implementation)
 *
 * Uses WarpDrive's factory from @warp-drive/legacy which automatically provides:
 * - SchemaService with derivations registered
 * - JSONAPICache for JSON:API responses
 * - RequestManager with Fetch handler
 * - CacheHandler integration
 * - Default cache policy (15m hard / 30s soft expiration)
 * - instantiateRecord/teardownRecord implementations
 *
 * WHY "LEGACY" IS ACTUALLY FORWARD-COMPATIBLE:
 * Despite the name, this uses WarpDrive's modern patterns. The "legacy" refers to
 * supporting migration features (linksMode, legacyRequests, modelFragments) that
 * we can disable. It's the v5.x equivalent of useRecommendedStore (coming in v6).
 *
 * This approach is endorsed by the WarpDrive team for v5.x apps moving forward.
 *
 * PROS:
 * - Less boilerplate (no manual method implementations)
 * - Factory pattern with sensible defaults
 * - Handles all the wiring automatically
 * - Can disable legacy features we don't need
 *
 * CONS:
 * - Name suggests "legacy" but it's actually modern
 * - Requires @warp-drive/legacy package
 * - Less explicit control (more "magic")
 *
 * See also: store-manual.js.bak for the manual implementation approach
 */
const StoreClass = useRecommendedStore({
  // Cache implementation for storing JSON:API data
  cache: JSONAPICache,

  // Custom request handlers
  // Order: BaseURL → Logging → RelationshipLinks → Fetch (auto-added)
  // Response flow (reversed): Fetch → RelationshipLinks → Logging → BaseURL
  //
  // Flow:
  // 1. Fetch gets the response
  // 2. RelationshipLinks injects links into all relationships
  // 3. Logging logs the enhanced response
  handlers: [BaseURLHandler, LoggingHandler, RelationshipLinksHandler],

  // Schemas can be registered here or after instantiation
  // We'll register after for now to keep pattern from Iteration 1
  schemas: [],
});

// Extend the generated class to add schema registration
export default class ApplicationStoreService extends StoreClass {
  constructor(...args) {
    super(...args);

    // Register resource schemas after the store is fully initialized
    registerPostSchema(this);
    registerUserSchema(this);
    registerCategorySchema(this);
    registerTagSchema(this);
  }
}

