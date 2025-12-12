import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { queryUsers } from 'ui/builders/users';

/**
 * Users Index Route
 * 
 * Fetches and displays a list of all users from the API.
 */
export default class UsersRoute extends Route {
  @service store;

  async model() {
    try {
      const request = queryUsers();
      const response = await this.store.request(request);

      return {
        users: response.content.data,
        meta: response.content.meta,
        rawResponse: response
      };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      
      return {
        users: [],
        meta: null,
        error: {
          message: error.message || 'Failed to fetch users',
          detail: error
        }
      };
    }
  }
}

