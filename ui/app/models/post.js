/**
 * Post Resource Schema
 *
 * Defines the schema for blog posts matching the JSON:API server structure.
 * For Iteration 1, we're keeping this simple with just attributes (no relationships).
 */

/**
 * Register the post schema with the store.
 *
 * This should be called in your store service or application initialization.
 *
 * Example usage:
 * ```
 * import { registerPostSchema } from 'ui/models/post';
 * registerPostSchema(store);
 * ```
 *
 * @param {Store} store - The WarpDrive store instance
 */
export function registerPostSchema(store) {
  store.schema.registerResource({
    // Resource type (must match JSON:API 'type' field exactly)
    type: 'posts',

    // Primary key configuration
    identity: {
      kind: '@id',
      name: 'id'
    },

    // Field definitions
    fields: [
      // Core content fields
      {
        kind: 'field',
        name: 'title'
      },
      {
        kind: 'field',
        name: 'slug'
      },
      {
        kind: 'field',
        name: 'body'
      },
      {
        kind: 'field',
        name: 'excerpt'
      },

      // Status field (enum: draft, published, archived)
      {
        kind: 'field',
        name: 'status'
      },

      // Timestamps (using camelCase locally, kebab-case on API)
      {
        kind: 'field',
        name: 'publishedAt',
        sourceKey: 'publishedAt'
        // Note: Could add type: 'date-time' for transform in future iterations
      },
      {
        kind: 'field',
        name: 'createdAt',
        sourceKey: 'createdAt'
      },
      {
        kind: 'field',
        name: 'updatedAt',
        sourceKey: 'updatedAt'
      },

      // Count fields (integers)
      {
        kind: 'field',
        name: 'viewCount',
        sourceKey: 'viewCount'
      },
      {
        kind: 'field',
        name: 'likeCount',
        sourceKey: 'likeCount'
      },
      {
        kind: 'field',
        name: 'commentCount',
        sourceKey: 'commentCount'
      }

      // Relationships will be added in Iteration 2:
      // - author (belongs-to user)
      // - category (belongs-to category)
      // - tags (has-many tags)
    ]
  });
}
