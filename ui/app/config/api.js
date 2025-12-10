import config from 'ui/config/environment';

const apiHost = (config.apiHost || 'http://localhost:3000').replace(/\/+$/, '');
const apiNamespace = (config.apiNamespace || 'api').replace(/^\/+|\/+$/g, '');

const apiBaseURL = apiNamespace ? `${apiHost}/${apiNamespace}` : apiHost;

function buildURL(base, path = '') {
  const cleanedPath = path.replace(/^\/+/, '');
  const url = new URL(base.endsWith('/') ? base : `${base}/`);

  if (cleanedPath) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${cleanedPath}`;
  }

  return url.toString().replace(/\/+$/, '');
}

export { apiBaseURL, apiHost, apiNamespace };

export function apiURL(path = '', { useNamespace = true } = {}) {
  const base = useNamespace ? apiBaseURL : apiHost;
  return buildURL(base, path);
}

export function rootURL(path = '') {
  return apiURL(path, { useNamespace: false });
}

