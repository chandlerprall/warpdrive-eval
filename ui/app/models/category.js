/**
 * Category Resource Schema
 *
 * Defines the schema for categories matching the JSON:API server structure.
 * For Iteration 1, we're keeping this simple with just attributes (no relationships).
 */

/**
 * Register the category schema with the store.
 *
 * @param {Store} store - The WarpDrive store instance
 */
export function registerCategorySchema(store) {
  store.schema.registerResource({
    // Resource type (must match JSON:API 'type' field)
    type: 'categories',

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
        name: 'description'
      },
      {
        kind: 'field',
        name: 'postCount',
        sourceKey: 'postCount'
      },

      // Relationships (Iteration 2)

      // has-many: posts in this category
      {
        kind: 'collection',
        name: 'posts',
        type: 'posts',
        options: { inverse: 'category' }
      }
    ]
  });
}

