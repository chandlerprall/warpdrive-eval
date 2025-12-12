import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { queryTags } from 'ui/builders/tags';

/**
 * Tags Index Route
 * 
 * Fetches and displays a list of all tags from the API.
 */
export default class TagsRoute extends Route {
  @service store;

  async model() {
    try {
      const request = queryTags();
      const response = await this.store.request(request);

      return {
        tags: response.content.data,
        meta: response.content.meta,
        rawResponse: response
      };
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      
      return {
        tags: [],
        meta: null,
        error: {
          message: error.message || 'Failed to fetch tags',
          detail: error
        }
      };
    }
  }
}

