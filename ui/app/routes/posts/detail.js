import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findPost } from 'ui/builders/posts';

/**
 * Post Detail Route
 *
 * ASYNC RELATIONSHIP EXPLORATION:
 * - Only includes author in the initial request
 * - Category and tags are marked as async: true in the schema
 * - When accessed in the template, WarpDrive should load them on-demand
 *
 * This tests WarpDrive's async relationship loading behavior:
 * - Does it automatically fetch when accessed?
 * - How does it handle the loading state?
 * - What network requests are made?
 */
export default class PostsDetailRoute extends Route {
  @service store;

  async model(params) {
    try {
      // ONLY include author - let category and tags load through relationships
      const request = findPost(params.id, { include: 'author' });

      // Execute the request through the store
      // This will:
      // 1. Fetch GET /posts/:id?include=author
      // 2. Parse the JSON:API response with main data + included author
      // 3. Update the cache with post and author records
      // 4. Category and tags will have links but no data yet
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

