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

