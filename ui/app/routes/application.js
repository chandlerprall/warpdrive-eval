import Route from '@ember/routing/route';
import { apiHost, apiNamespace } from 'ui/config/api';
import { fetchJSON } from 'ui/utils/fetch-json';

export default class ApplicationRoute extends Route {
  async model() {
    const model = {
      apiHost,
      apiNamespace,
    };

    try {
      const { json } = await fetchJSON('/health', { useNamespace: false });
      model.health = { state: 'ok', isOk: true, detail: json };
    } catch (error) {
      model.health = {
        state: 'error',
        isOk: false,
        detail: error.message,
        payload: error.payload,
        status: error.status,
      };
    }

    return model;
  }
}

