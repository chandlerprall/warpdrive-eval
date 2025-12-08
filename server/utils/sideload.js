/**
 * Sideloading Utilities
 * 
 * Handles loading and including related resources based on ?include parameter
 */

const store = require('../store');
const { userSerializer, postSerializer, categorySerializer, tagSerializer } = require('../serializers');

/**
 * Get serializer for a resource type
 */
function getSerializer(type) {
  const serializers = {
    users: userSerializer,
    posts: postSerializer,
    categories: categorySerializer,
    tags: tagSerializer
  };
  return serializers[type];
}

/**
 * Collect unique IDs from relationships
 */
function collectRelationshipIds(resources, relationshipName) {
  const ids = new Set();
  
  resources.forEach(resource => {
    if (resource.relationships && resource.relationships[relationshipName]) {
      const relData = resource.relationships[relationshipName].data;
      if (Array.isArray(relData)) {
        relData.forEach(item => ids.add(item.id));
      } else if (relData) {
        ids.add(relData.id);
      }
    }
  });
  
  return Array.from(ids);
}

/**
 * Load related resources for sideloading
 * 
 * @param {Array} resources - Already serialized primary resources
 * @param {Array} includeList - List of relationship names to include (e.g., ['author', 'category'])
 * @param {String} primaryType - Primary resource type (e.g., 'posts')
 * @param {Object} options - Options including sparseFields
 * @returns {Array} - Array of included resource objects
 */
function loadIncluded(resources, includeList, primaryType, options = {}) {
  if (!includeList || includeList.length === 0) {
    return [];
  }

  const included = [];
  const addedResources = new Set(); // Track to avoid duplicates

  // Map relationship names to resource types and store types
  const relationshipMap = {
    posts: {
      author: { resourceType: 'users', storeType: 'users' },
      category: { resourceType: 'categories', storeType: 'categories' },
      tags: { resourceType: 'tags', storeType: 'tags' }
    },
    users: {
      posts: { resourceType: 'posts', storeType: 'posts' }
    }
  };

  includeList.forEach(relationshipName => {
    const mapping = relationshipMap[primaryType]?.[relationshipName];
    if (!mapping) {
      console.warn(`Unknown relationship '${relationshipName}' for type '${primaryType}'`);
      return;
    }

    // Collect IDs that need to be loaded
    const ids = collectRelationshipIds(resources, relationshipName);
    
    // Load and serialize related resources
    ids.forEach(id => {
      const key = `${mapping.resourceType}-${id}`;
      if (addedResources.has(key)) return; // Skip duplicates
      
      const record = store.findById(mapping.storeType, id);
      if (record) {
        const serializer = getSerializer(mapping.resourceType);
        const serialized = serializer.serialize(record, {
          sparseFields: options.sparseFields
        });
        
        included.push(serialized);
        addedResources.add(key);
      }
    });
  });

  return included;
}

module.exports = {
  loadIncluded,
  getSerializer
};

