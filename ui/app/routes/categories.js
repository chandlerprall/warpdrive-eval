import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { queryCategories } from 'ui/builders/categories';

/**
 * Categories Index Route
 * 
 * Fetches and displays a list of all categories from the API.
 */
export default class CategoriesRoute extends Route {
  @service store;

  async model() {
    try {
      const request = queryCategories();
      const response = await this.store.request(request);

      return {
        categories: response.content.data,
        meta: response.content.meta,
        rawResponse: response
      };
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      
      return {
        categories: [],
        meta: null,
        error: {
          message: error.message || 'Failed to fetch categories',
          detail: error
        }
      };
    }
  }
}

