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
      },

      // Relationships (Iteration 2)

      // has-many: posts with this tag (many-to-many)
      {
        kind: 'collection',
        name: 'posts',
        type: 'posts',
        options: { inverse: 'tags' }
      }
    ]
  });
}

