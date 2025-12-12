import Route from '@ember/routing/route';

/**
 * Index Route (Home Page)
 * 
 * Redirects to application route but provides a distinct route
 * for navigation active state handling.
 */
export default class IndexRoute extends Route {
  // No model needed - application route handles health check
}

