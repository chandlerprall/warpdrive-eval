/**
 * Query Parameter Parsing Utilities
 * 
 * Parses JSON:API query parameters for pagination, filtering, sorting, includes, and sparse fieldsets
 */

/**
 * Parse pagination parameters
 * Example: ?page[number]=2&page[size]=10
 * 
 * @param {Object} query - Express req.query object
 * @returns {Object} - { page: number, size: number }
 */
function parsePagination(query) {
  const defaults = { page: 1, size: 20 };
  
  if (!query.page) {
    return defaults;
  }

  const page = parseInt(query.page.number || query.page) || defaults.page;
  const size = parseInt(query.page.size) || defaults.size;

  // Enforce limits
  return {
    page: Math.max(1, page),
    size: Math.min(100, Math.max(1, size)) // Max 100 per page
  };
}

/**
 * Parse filter parameters
 * Example: ?filter[status]=published&filter[authorId]=1
 * 
 * @param {Object} query - Express req.query object
 * @returns {Object} - Filter object { status: 'published', authorId: '1' }
 */
function parseFilters(query) {
  const filters = {};
  
  // Check for filter object (when parsed by Express)
  if (query.filter && typeof query.filter === 'object') {
    Object.assign(filters, query.filter);
  }
  
  // Also check for individual filter parameters (backup method)
  Object.keys(query).forEach(key => {
    const match = key.match(/^filter\[(\w+)\]$/);
    if (match) {
      filters[match[1]] = query[key];
    }
  });
  
  return filters;
}

/**
 * Parse sort parameters
 * Example: ?sort=-publishedAt,title (descending publishedAt, then ascending title)
 * 
 * @param {String} sortStr - Sort parameter string
 * @returns {Array} - Array of sort specs [{ field: 'publishedAt', order: 'desc' }, ...]
 */
function parseSort(sortStr) {
  if (!sortStr) return [];
  
  return sortStr.split(',').map(field => {
    const trimmed = field.trim();
    const descending = trimmed.startsWith('-');
    
    return {
      field: descending ? trimmed.slice(1) : trimmed,
      order: descending ? 'desc' : 'asc'
    };
  });
}

/**
 * Parse include (sideloading) parameters
 * Example: ?include=author,category,tags
 * 
 * @param {String} includeStr - Include parameter string
 * @returns {Array} - Array of relationship names to include
 */
function parseInclude(includeStr) {
  if (!includeStr) return [];
  
  return includeStr.split(',').map(rel => rel.trim());
}

/**
 * Parse sparse fieldsets parameters
 * Example: ?fields[posts]=title,status&fields[users]=username
 * 
 * @param {Object} query - Express req.query object
 * @returns {Object} - { posts: ['title', 'status'], users: ['username'] }
 */
function parseFields(query) {
  const fields = {};
  
  // Check for fields object (when parsed by Express)
  if (query.fields && typeof query.fields === 'object') {
    Object.keys(query.fields).forEach(type => {
      const fieldList = query.fields[type];
      fields[type] = typeof fieldList === 'string' 
        ? fieldList.split(',').map(f => f.trim())
        : fieldList;
    });
  }
  
  // Also check for individual field parameters (backup method)
  Object.keys(query).forEach(key => {
    const match = key.match(/^fields\[(\w+)\]$/);
    if (match) {
      const fieldList = query[key];
      fields[match[1]] = typeof fieldList === 'string'
        ? fieldList.split(',').map(f => f.trim())
        : fieldList;
    }
  });
  
  return fields;
}

/**
 * Parse all query parameters at once
 * 
 * @param {Object} query - Express req.query object
 * @returns {Object} - Parsed query params
 */
function parseQueryParams(query) {
  return {
    pagination: parsePagination(query),
    filters: parseFilters(query),
    sort: parseSort(query.sort),
    include: parseInclude(query.include),
    fields: parseFields(query)
  };
}

module.exports = {
  parsePagination,
  parseFilters,
  parseSort,
  parseInclude,
  parseFields,
  parseQueryParams
};

