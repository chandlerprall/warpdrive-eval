/**
 * Tag Resource Schema
 * 
 * Defines the schema for tags matching the JSON:API server structure.
 * For Iteration 1, we're keeping this simple with just attributes (no relationships).
 */

/**
 * Register the tag schema with the store.
 * 
 * @param {Store} store - The WarpDrive store instance
 */
export function registerTagSchema(store) {
  store.schema.registerResource({
    // Resource type (must match JSON:API 'type' field)
    type: 'tags',

    // Primary key configuration
    identity: {
      kind: '@id',
      name: 'id'
    },

    // Enable legacy mode (recommended for Ember apps)
    legacy: true,

    // Field definitions
    fields: [
      {
        kind: 'field',
        name: 'name'
      },
      {
        kind: 'field',
        name: 'slug'
      },
      {
        kind: 'field',
        name: 'postCount',
        sourceKey: 'postCount'
      }

      // Relationships will be added in Iteration 2:
      // - posts (has-many through join table)
    ]
  });
}

