import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findPost } from 'ui/builders/posts';

/**
 * Post Detail Route
 *
 * ON-DEMAND RELATIONSHIP LOADING:
 * - Fetches only the post record initially (no includes)
 * - Relationships (author, category) are loaded on-demand by ResolveRelationship component
 * - Each relationship is fetched when the component renders in the template
 * - Component handles loading states and caching automatically
 *
 * This pattern provides:
 * - Cleaner route code (no manual .fetch() calls)
 * - Better UX (loading indicators per relationship)
 * - Reactive updates (component re-fetches if relationship changes)
 * - DX-friendly API (wrap relationship in component, get data back)
 */
export default class PostsDetailRoute extends Route {
  @service store;

  async model(params) {
    try {
      // Fetch just the post - ResolveRelationship component will handle relationships
      const request = findPost(params.id, { include: null });

      // Execute the request through the store
      // This will:
      // 1. Fetch GET /posts/:id (no includes)
      // 2. Parse the JSON:API response
      // 3. Update the cache with post record
      // 4. Relationships will have links but no data yet
      // 5. ResolveRelationship component will fetch relationships on-demand
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

