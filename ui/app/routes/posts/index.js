import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { queryPublishedPosts } from 'ui/builders/posts';

/**
 * Posts Index Route
 *
 * Fetches and displays a list of published posts from the API.
 *
 * Features:
 * - Filters for published posts only
 * - Uses custom builder pattern (recommended by WarpDrive)
 * - Returns raw response for learning/debugging
 */
export default class PostsIndexRoute extends Route {
  @service store;

  async model() {
    try {
      // Use our builder to create the request object
      // The builder returns a plain object with url, method, headers, etc.
      // This pattern keeps request logic reusable and testable
      const request = queryPublishedPosts();

      // Execute the request through the store
      // This will:
      // 1. Go through our RequestManager (BaseURL → Logging → Fetch)
      // 2. Hit the API at GET /posts?filter[status]=published
      // 3. Parse the JSON:API response
      // 4. Update the cache with post records
      // 5. Return the response with content
      const response = await this.store.request(request);

      // Return both the content and raw response for learning
      return {
        posts: response.content.data,
        meta: response.content.meta,
        rawResponse: response // Useful for debugging in console
      };
    } catch (error) {
      console.error('Failed to fetch posts:', error);

      // Return error state instead of throwing
      // This allows the template to render with error info
      return {
        posts: [],
        meta: null,
        error: {
          message: error.message || 'Failed to fetch posts',
          detail: error
        }
      };
    }
  }
}

