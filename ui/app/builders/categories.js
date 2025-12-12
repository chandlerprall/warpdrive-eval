/**
 * Request builders for Category resources
 */

/**
 * Query for all categories
 * 
 * @param {Object} options - Query options
 * @param {string} [options.sort='name'] - Sort order
 * @returns {Object} Request object for store.request()
 */
export function queryCategories(options = {}) {
  const { sort = 'name' } = options;

  const params = new URLSearchParams();
  
  if (sort) {
    params.append('sort', sort);
  }

  const queryString = params.toString();
  const url = `/categories${queryString ? `?${queryString}` : ''}`;

  return {
    url,
    method: 'GET',
    headers: new Headers({
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    })
  };
}

