import { apiBaseURL } from 'ui/config/api';

/**
 * Handler that prefixes relative URLs with the API base URL
 *
 * This handler intercepts requests and adds the configured API base URL
 * to any relative URLs, allowing routes/builders to use paths like `/posts`
 * instead of `http://localhost:3000/api/posts`.
 *
 * Absolute URLs (starting with http:// or https://) are left unchanged.
 */
export const BaseURLHandler = {
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

/**
 * Handler that logs request/response timing
 *
 * Logs every request and response to the console with timing information.
 * Useful for debugging and understanding the request flow during development.
 */
export const LoggingHandler = {
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

