import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findPost } from 'ui/builders/posts';

/**
 * Post Detail Route
 *
 * Fetches a single post by ID with its relationships (author, category, tags).
 *
 * Features:
 * - Includes relationships using JSON:API include parameter
 * - Demonstrates how WarpDrive handles sideloaded relationships
 *
 * Note: Currently uses numeric IDs. In Iteration 3+, we could enhance this to support
 * slug-based URLs by either: (a) adding slug lookup to the API, or (b) loading the
 * post list and finding by slug client-side.
 */
export default class PostsDetailRoute extends Route {
  @service store;

  async model(params) {
    try {
      // Use our builder to create the request with includes
      const request = findPost(params.id);

      // Execute the request through the store
      // This will:
      // 1. Fetch GET /posts/:id?include=author,category,tags
      // 2. Parse the JSON:API response with main data + included
      // 3. Update the cache with all records (post, author, category, tags)
      // 4. Link relationships automatically based on schema definitions
      const response = await this.store.request(request);

      // The post data will have reactive relationship accessors
      const post = response.content.data;

      return {
        post,
        // included resources are automatically in the cache
        // we can access them via the reactive relationship properties
        included: response.content.included || [],
        rawResponse: response
      };
    } catch (error) {
      console.error('Failed to fetch post:', error);

      return {
        post: null,
        included: [],
        error: {
          message: error.message || 'Failed to fetch post',
          detail: error
        }
      };
    }
  }
}

