/**
 * User Resource Schema
 *
 * Defines the schema for users matching the JSON:API server structure.
 * For Iteration 1, we're keeping this simple with just attributes (no relationships).
 */

/**
 * Register the user schema with the store.
 *
 * @param {Store} store - The WarpDrive store instance
 */
export function registerUserSchema(store) {
  store.schema.registerResource({
    // Resource type (must match JSON:API 'type' field)
    type: 'users',

    // Primary key configuration
    identity: {
      kind: '@id',
      name: 'id'
    },

    // Enable legacy mode (recommended for Ember apps)
    legacy: true,

    // Field definitions
    fields: [
      // Core user fields
      {
        kind: 'field',
        name: 'username'
      },
      {
        kind: 'field',
        name: 'email'
      },
      {
        kind: 'field',
        name: 'displayName',
        sourceKey: 'displayName'
      },
      {
        kind: 'field',
        name: 'bio'
      },
      {
        kind: 'field',
        name: 'avatarUrl',
        sourceKey: 'avatarUrl'
      },

      // Timestamps
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

      // Relationships (Iteration 2)

      // has-many: posts authored by this user
      {
        kind: 'collection',
        name: 'posts',
        type: 'posts',
        options: { inverse: 'author' }
      }

      // Note: followers/following relationships deferred to later iteration
    ]
  });
}

