import { CacheHandler, Store } from '@warp-drive/core';
import {
  SchemaService,
  registerDerivations,
  instantiateRecord,
  teardownRecord,
} from '@warp-drive/core/reactive';
import { JSONAPICache } from '@warp-drive/json-api';
import { createRequestManager } from 'ui/utils/request-manager';
import { registerPostSchema } from 'ui/models/post';

/**
 * Application Store Service
 *
 * Extends WarpDrive's Store with:
 * - Custom RequestManager (with BaseURL handler and logging)
 * - SchemaService for managing resource schemas
 * - JSONAPICache for storing and managing data
 * - Schema registration for our models
 */
export default class ApplicationStoreService extends Store {
  constructor(...args) {
    super(...args);

    // Set up the request manager with our custom handlers
    this.requestManager = createRequestManager().useCache(CacheHandler);

    // Register resource schemas after the store is fully initialized
    // This ensures store.schema is available
    registerPostSchema(this);
  }

  /**
   * Create the schema service for managing resource schemas
   * This is called by the Store during initialization
   */
  createSchemaService() {
    const schema = new SchemaService();
    registerDerivations(schema);
    return schema;
  }

  /**
   * Create the cache for storing and managing data
   * JSONAPICache understands JSON:API format responses
   *
   * @param {CacheCapabilitiesManager} capabilities - Cache capabilities
   */
  createCache(capabilities) {
    return new JSONAPICache(capabilities);
  }

  /**
   * Instantiate a record from the cache
   * Creates reactive record instances from cached data
   *
   * @param {ResourceKey} identifier - The resource identifier
   * @param {Object} createArgs - Optional creation arguments
   */
  instantiateRecord(identifier, createArgs) {
    return instantiateRecord(this, identifier, createArgs);
  }

  /**
   * Teardown a record when it's no longer needed
   * Cleans up reactive subscriptions and resources
   *
   * @param {unknown} record - The record to teardown
   */
  teardownRecord(record) {
    return teardownRecord(record);
  }
}

