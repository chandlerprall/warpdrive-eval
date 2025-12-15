import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findUser } from 'ui/builders/users';

/**
 * User Detail Route
 *
 * Fetches a single user by ID with their posts.
 *
 * Features:
 * - Includes user's posts using JSON:API include parameter
 * - Demonstrates has-many relationships
 */
export default class UsersDetailRoute extends Route {
  @service store;

  async model(params) {
    try {
      // Use our builder to create the request with includes
      const request = findUser(params.id);

      // Execute the request through the store
      // This will:
      // 1. Fetch GET /users/:id?include=posts
      // 2. Parse the JSON:API response with main data + included posts
      // 3. Update the cache with user and post records
      // 4. Link the has-many relationship automatically
      const response = await this.store.request(request);

      const user = response.content.data;
      
      return {
        user,
        included: response.content.included || [],
        rawResponse: response
      };
    } catch (error) {
      console.error('Failed to fetch user:', error);

      return {
        user: null,
        included: [],
        error: {
          message: error.message || 'Failed to fetch user',
          detail: error
        }
      };
    }
  }
}


