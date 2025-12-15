/**
 * Request builders for Post resources
 *
 * These functions return plain request objects that can be passed to store.request().
 * They follow WarpDrive's recommended builder pattern for organizing reusable requests.
 */

/**
 * Query for published posts
 *
 * Builds a GET request to /posts with a filter for published status.
 * The API will return posts in JSON:API format.
 *
 * @param {Object} options - Query options
 * @param {string} [options.status='published'] - Post status to filter by
 * @param {number} [options.pageSize=10] - Number of posts per page
 * @param {number} [options.pageNumber=1] - Page number
 * @param {string} [options.sort='-publishedAt'] - Sort order
 * @returns {Object} Request object for store.request()
 *
 * @example
 * const { content } = await store.request(queryPublishedPosts());
 * console.log(content.data); // Array of post records
 */
export function queryPublishedPosts(options = {}) {
  const {
    status = 'published',
    pageSize = 10,
    pageNumber = 1,
    sort = '-publishedAt'
  } = options;

  // Build query params manually for JSON:API format
  const params = new URLSearchParams();

  if (status) {
    params.append('filter[status]', status);
  }

  if (sort) {
    params.append('sort', sort);
  }

  params.append('page[size]', pageSize.toString());
  params.append('page[number]', pageNumber.toString());

  const queryString = params.toString();
  const url = `/posts${queryString ? `?${queryString}` : ''}`;

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
 * Query for all posts (no filtering)
 *
 * @param {Object} options - Query options
 * @param {number} [options.pageSize=10] - Number of posts per page
 * @param {number} [options.pageNumber=1] - Page number
 * @param {string} [options.sort='-publishedAt'] - Sort order
 * @returns {Object} Request object for store.request()
 */
export function queryAllPosts(options = {}) {
  return queryPublishedPosts({ ...options, status: null });
}

/**
 * Find a single post by ID with relationships
 *
 * Builds a GET request to /posts/:id with include parameter to sideload
 * related resources (author, category, tags) in a single request.
 *
 * Note: The API uses numeric IDs for lookups. In a production app, you might
 * want to add slug-based lookup support to the API for SEO-friendly URLs.
 *
 * @param {string} id - Post ID
 * @param {Object} options - Query options
 * @param {string} [options.include='author,category,tags'] - Related resources to include
 * @returns {Object} Request object for store.request()
 *
 * @example
 * const { content } = await store.request(findPost('1'));
 * console.log(content.data); // Post record
 * console.log(content.included); // Array of related records (author, category, tags)
 */
export function findPost(id, options = {}) {
  const { include = 'author,category,tags' } = options;

  const params = new URLSearchParams();
  
  if (include) {
    params.append('include', include);
  }

  const queryString = params.toString();
  const url = `/posts/${id}${queryString ? `?${queryString}` : ''}`;

  return {
    url,
    method: 'GET',
    headers: new Headers({
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    })
  };
}

