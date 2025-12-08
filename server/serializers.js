/**
 * JSON:API Serialization Helpers
 * 
 * Transforms internal data structures to JSON:API format
 * https://jsonapi.org/format/
 */

/**
 * Serialize a single resource to JSON:API format
 */
function serializeResource(type, record, options = {}) {
  if (!record) return null;

  const resource = {
    type,
    id: String(record.id),
    attributes: {}
  };

  // Get all attributes except id and relationship foreign keys
  const relationshipKeys = options.relationshipKeys || [];
  // Also filter out any keys ending in 'Id' or 'Ids' (foreign keys)
  let attributeKeys = Object.keys(record).filter(key => 
    key !== 'id' && 
    !relationshipKeys.includes(key) &&
    !key.endsWith('Id') &&
    !key.endsWith('Ids')
  );

  // Apply sparse fieldsets if specified
  if (options.sparseFields && options.sparseFields[type]) {
    attributeKeys = attributeKeys.filter(key => 
      options.sparseFields[type].includes(key)
    );
  }

  // Add attributes
  attributeKeys.forEach(key => {
    resource.attributes[key] = record[key];
  });

  // Add relationships if specified
  if (options.relationships) {
    resource.relationships = {};
    Object.entries(options.relationships).forEach(([name, config]) => {
      if (config.type === 'belongs-to') {
        const foreignKey = config.foreignKey || `${name}Id`;
        if (record[foreignKey]) {
          resource.relationships[name] = {
            data: { type: config.resourceType, id: String(record[foreignKey]) }
          };
        }
      } else if (config.type === 'has-many') {
        const foreignKey = config.foreignKey || `${name}Ids`;
        if (record[foreignKey]) {
          resource.relationships[name] = {
            data: record[foreignKey].map(id => ({
              type: config.resourceType,
              id: String(id)
            }))
          };
        }
      }
    });
  }

  return resource;
}

/**
 * Serialize a collection of resources
 */
function serializeCollection(type, records, options = {}) {
  const data = records.map(record => serializeResource(type, record, options));
  
  const response = { data };

  if (options.meta) {
    response.meta = options.meta;
  }

  // Add included resources if sideloading
  if (options.included && options.included.length > 0) {
    response.included = options.included;
  }

  return response;
}

/**
 * Serialize an error response
 */
function serializeError(status, title, detail, meta = {}) {
  return {
    errors: [{
      status: String(status),
      title,
      detail,
      ...meta
    }]
  };
}

/**
 * Deserialize JSON:API request to internal format
 */
function deserializeResource(jsonApiData) {
  if (!jsonApiData || !jsonApiData.data) {
    throw new Error('Invalid JSON:API format');
  }

  const { data } = jsonApiData;
  const record = {
    ...(data.attributes || {})
  };

  // Include ID if present (for updates)
  if (data.id) {
    record.id = data.id;
  }

  // Extract relationship IDs
  if (data.relationships) {
    Object.entries(data.relationships).forEach(([name, rel]) => {
      if (rel.data) {
        if (Array.isArray(rel.data)) {
          // has-many relationship
          record[`${name}Ids`] = rel.data.map(r => r.id);
        } else {
          // belongs-to relationship
          record[`${name}Id`] = rel.data.id;
        }
      }
    });
  }

  return record;
}

// Resource-specific serializers with relationship definitions

const userSerializer = {
  serialize: (user, options = {}) => serializeResource('users', user, {
    relationshipKeys: [],
    ...options
  }),
  serializeMany: (users, options = {}) => serializeCollection('users', users, options)
};

const postSerializer = {
  serialize: (post, options = {}) => serializeResource('posts', post, {
    relationshipKeys: ['authorId', 'categoryId', 'tagIds'],
    relationships: {
      author: { type: 'belongs-to', resourceType: 'users', foreignKey: 'authorId' },
      category: { type: 'belongs-to', resourceType: 'categories', foreignKey: 'categoryId' },
      tags: { type: 'has-many', resourceType: 'tags', foreignKey: 'tagIds' }
    },
    ...options
  }),
  serializeMany: (posts, options = {}) => serializeCollection('posts', posts, {
    relationshipKeys: ['authorId', 'categoryId', 'tagIds'],
    relationships: {
      author: { type: 'belongs-to', resourceType: 'users', foreignKey: 'authorId' },
      category: { type: 'belongs-to', resourceType: 'categories', foreignKey: 'categoryId' },
      tags: { type: 'has-many', resourceType: 'tags', foreignKey: 'tagIds' }
    },
    ...options
  })
};

const categorySerializer = {
  serialize: (category, options = {}) => serializeResource('categories', category, {
    relationshipKeys: [],
    ...options
  }),
  serializeMany: (categories, options = {}) => serializeCollection('categories', categories, options)
};

const tagSerializer = {
  serialize: (tag, options = {}) => serializeResource('tags', tag, {
    relationshipKeys: [],
    ...options
  }),
  serializeMany: (tags, options = {}) => serializeCollection('tags', tags, options)
};

module.exports = {
  serializeResource,
  serializeCollection,
  serializeError,
  deserializeResource,
  userSerializer,
  postSerializer,
  categorySerializer,
  tagSerializer
};

