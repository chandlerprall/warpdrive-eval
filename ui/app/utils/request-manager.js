import { RequestManager, Fetch } from '@warp-drive/core';
import { apiBaseURL } from 'ui/config/api';

// Handler that prefixes relative URLs with the API base URL
const BaseURLHandler = {
  async request(context, next) {
    const { request } = context;

    if (request?.url) {
      const isAbsolute = /^https?:\/\//i.test(request.url);
      if (!isAbsolute) {
        const base = apiBaseURL.replace(/\/+$/, '');
        const path = String(request.url).replace(/^\/+/, '');
        context.request = {
          ...request,
          url: `${base}/${path}`,
        };
      }
    }

    return next(context.request);
  },
};

// Handler that logs request/response timing
const LoggingHandler = {
  async request(context, next) {
    const { request } = context;
    const method = request?.method || 'GET';
    const url = request?.url || '<no-url>';
    const started = performance.now();

    console.debug(`[request] ${method} ${url}`, request);

    const response = await next(request);

    const elapsed = (performance.now() - started).toFixed(1);
    console.debug(`[response] ${method} ${url} (${elapsed}ms)`, response);

    return response;
  },
};

export function createRequestManager() {
  const manager = new RequestManager();

  manager.use([BaseURLHandler, LoggingHandler, Fetch]);

  return manager;
}

