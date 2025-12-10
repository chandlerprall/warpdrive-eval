import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { apiHost, apiNamespace } from 'ui/config/api';

export default class ApplicationRoute extends Route {
  @service store;

  async model() {
    const model = {
      apiHost,
      apiNamespace,
    };

    try {
      // Health check hits the host directly without namespace (e.g., http://localhost:3000/health)
      const healthUrl = `${apiHost}/health`;
      const response = await this.store.requestManager.request({
        url: healthUrl,
      });

      model.health = { state: 'ok', isOk: true, detail: response.content };
    } catch (error) {
      model.health = {
        state: 'error',
        isOk: false,
        detail: error.message,
        payload: error.content,
        status: error.status,
      };
    }

    return model;
  }
}

