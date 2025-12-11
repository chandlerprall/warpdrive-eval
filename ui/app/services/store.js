import { useLegacyStore } from '@warp-drive/legacy';
import { JSONAPICache } from '@warp-drive/json-api';
import { BaseURLHandler, LoggingHandler } from 'ui/utils/request-manager';
import { registerPostSchema } from 'ui/models/post';

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
const StoreClass = useLegacyStore({
  // Cache implementation for storing JSON:API data
  cache: JSONAPICache,

  // Legacy features - all disabled for modern patterns
  linksMode: false,           // Don't use links-based relationships
  legacyRequests: false,      // Don't use legacy request methods
  modelFragments: false,      // Don't use model fragments

  // Custom request handlers (BaseURL, Logging)
  // Fetch is automatically added at the end
  handlers: [BaseURLHandler, LoggingHandler],

  // Schemas can be registered here or after instantiation
  // We'll register after for now to keep pattern from Iteration 1
  schemas: [],
});

// Extend the generated class to add schema registration in constructor
export default class ApplicationStoreService extends StoreClass {
  constructor(...args) {
    super(...args);

    // Register resource schemas after the store is fully initialized
    registerPostSchema(this);
  }
}

