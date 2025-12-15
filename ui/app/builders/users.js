/**
 * Request builders for User resources
 */

/**
 * Query for all users
 * 
 * @param {Object} options - Query options
 * @param {number} [options.pageSize=20] - Number of users per page
 * @param {number} [options.pageNumber=1] - Page number
 * @param {string} [options.sort='username'] - Sort order
 * @returns {Object} Request object for store.request()
 */
export function queryUsers(options = {}) {
  const {
    pageSize = 20,
    pageNumber = 1,
    sort = 'username'
  } = options;

  const params = new URLSearchParams();
  
  if (sort) {
    params.append('sort', sort);
  }
  
  params.append('page[size]', pageSize.toString());
  params.append('page[number]', pageNumber.toString());

  const queryString = params.toString();
  const url = `/users${queryString ? `?${queryString}` : ''}`;

  return {
    url,
    method: 'GET',
    headers: new Headers({
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    })
  };
}

/**
 * Find a single user by ID with relationships
 *
 * Builds a GET request to /users/:id with include parameter to sideload
 * the user's posts in a single request.
 *
 * @param {string} id - User ID
 * @param {Object} options - Query options
 * @param {string} [options.include='posts'] - Related resources to include
 * @returns {Object} Request object for store.request()
 *
 * @example
 * const { content } = await store.request(findUser('1'));
 * console.log(content.data); // User record
 * console.log(content.included); // Array of related posts
 */
export function findUser(id, options = {}) {
  const { include = 'posts' } = options;

  const params = new URLSearchParams();
  
  if (include) {
    params.append('include', include);
  }

  const queryString = params.toString();
  const url = `/users/${id}${queryString ? `?${queryString}` : ''}`;

  return {
    url,
    method: 'GET',
    headers: new Headers({
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    })
  };
}

