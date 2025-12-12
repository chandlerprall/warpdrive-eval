import EmberRouter from '@embroider/router';
import config from 'ui/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('posts');
  this.route('users');
  this.route('categories');
  this.route('tags');
});
