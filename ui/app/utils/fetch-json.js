import { apiURL } from 'ui/config/api';

function buildBody(body, headers = {}) {
  if (!body) {
    return { body, headers };
  }

  if (
    typeof body === 'object' &&
    !(body instanceof FormData) &&
    !(body instanceof Blob)
  ) {
    return {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
  }

  return { body, headers };
}

export async function fetchJSON(path, options = {}) {
  const {
    useNamespace = true,
    headers = {},
    method = 'GET',
    body,
    ...rest
  } = options;

  const url = apiURL(path, { useNamespace });
  const { body: builtBody, headers: requestHeaders } = buildBody(body, headers);
  const startedAt = performance.now();
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: builtBody,
    ...rest,
  });
  const elapsed = (performance.now() - startedAt).toFixed(1);

  let json = null;
  try {
    json = await response.json();
  } catch (error) {
    // Intentionally swallow JSON parse errors; some endpoints may not return a body
  }

  // eslint-disable-next-line no-console
  console.debug(
    `[api] ${method.toUpperCase()} ${url} -> ${response.status} (${elapsed}ms)`,
    json
  );

  if (!response.ok) {
    const error = new Error(
      json?.errors?.[0]?.detail ||
        json?.message ||
        `Request failed with status ${response.status}`
    );
    error.payload = json;
    error.status = response.status;
    error.url = url;
    throw error;
  }

  return { json, response, url };
}

