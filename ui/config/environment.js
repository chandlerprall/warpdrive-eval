'use strict';

const DEFAULT_API_HOST = process.env.API_HOST || 'http://localhost:3000';
const DEFAULT_API_NAMESPACE = process.env.API_NAMESPACE || 'api';

function joinHostAndNamespace(host, namespace) {
  const normalizedHost = host.replace(/\/+$/, '');
  const normalizedNamespace = namespace.replace(/^\/+|\/+$/g, '');

  if (!normalizedNamespace) {
    return normalizedHost;
  }

  return `${normalizedHost}/${normalizedNamespace}`;
}

module.exports = function (environment) {
  const apiHost = process.env.API_HOST || DEFAULT_API_HOST;
  const apiNamespace = process.env.API_NAMESPACE || DEFAULT_API_NAMESPACE;

  const ENV = {
    modulePrefix: 'ui',
    environment,
    rootURL: '/',
    locationType: 'history',
    apiHost,
    apiNamespace,
    apiBaseURL: joinHostAndNamespace(apiHost, apiNamespace),
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      api: {
        host: apiHost,
        namespace: apiNamespace,
      },
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
