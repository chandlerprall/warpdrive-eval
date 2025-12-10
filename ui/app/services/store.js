import { Store } from '@warp-drive/core';
import { createRequestManager } from 'ui/utils/request-manager';

// Store bootstrap with a custom RequestManager that adds baseURL + logging.
// Future iterations can extend this to register schemas, cache config, etc.
export default class ApplicationStoreService extends Store {
  constructor(...args) {
    super(...args);
    this.requestManager = createRequestManager();
  }
}

