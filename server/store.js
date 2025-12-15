const fs = require('fs');
const path = require('path');

/**
 * In-Memory Data Store
 * 
 * Loads seed data from JSON file on initialization.
 * All operations happen in-memory.
 * Data resets on server restart (idempotent).
 */
class Store {
  constructor(seedFilePath) {
    this.seedFilePath = seedFilePath;
    this.data = {};
    this.load();
  }

  /**
   * Load seed data from JSON file
   */
  load() {
    try {
      const seedData = JSON.parse(
        fs.readFileSync(this.seedFilePath, 'utf-8')
      );
      
      // Deep clone to avoid mutations affecting the file
      this.data = JSON.parse(JSON.stringify(seedData));
      
      // Compute derived counts
      this.computeDerivedCounts();
      
      console.log('📦 Loaded seed data:', {
        users: this.data.users?.length || 0,
        posts: this.data.posts?.length || 0,
        categories: this.data.categories?.length || 0,
        tags: this.data.tags?.length || 0,
        comments: this.data.comments?.length || 0,
      });
    } catch (error) {
      console.error('❌ Error loading seed data:', error.message);
      this.data = {
        users: [],
        posts: [],
        categories: [],
        tags: [],
        comments: [],
        likes: [],
        follows: []
      };
    }
  }

  /**
   * Compute derived counts (postCount for categories/tags)
   */
  computeDerivedCounts() {
    const posts = this.data.posts || [];
    
    // Initialize counts to 0
    (this.data.categories || []).forEach(cat => cat.postCount = 0);
    (this.data.tags || []).forEach(tag => tag.postCount = 0);
    
    // Count posts for each category and tag
    posts.forEach(post => {
      // Count for category
      if (post.categoryId) {
        const category = (this.data.categories || []).find(c => c.id === post.categoryId);
        if (category) {
          category.postCount = (category.postCount || 0) + 1;
        }
      }
      
      // Count for tags
      if (post.tagIds && Array.isArray(post.tagIds)) {
        post.tagIds.forEach(tagId => {
          const tag = (this.data.tags || []).find(t => t.id === tagId);
          if (tag) {
            tag.postCount = (tag.postCount || 0) + 1;
          }
        });
      }
    });
  }

  /**
   * Reset store to seed data (useful for testing)
   */
  reset() {
    console.log('🔄 Resetting store to seed data...');
    this.load();
  }

  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Get all records of a type
   */
  findAll(type) {
    return this.data[type] || [];
  }

  /**
   * Find a single record by ID
   */
  findById(type, id) {
    const records = this.data[type] || [];
    return records.find(record => record.id === String(id));
  }

  /**
   * Find records matching a filter function
   */
  findBy(type, filterFn) {
    const records = this.data[type] || [];
    return records.filter(filterFn);
  }

  /**
   * Create a new record
   */
  create(type, data) {
    if (!this.data[type]) {
      this.data[type] = [];
    }

    // Generate ID if not provided
    const id = data.id || this.generateId(type);
    
    const record = {
      ...data,
      id: String(id),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };

    this.data[type].push(record);
    return record;
  }

  /**
   * Update an existing record
   */
  update(type, id, updates) {
    const records = this.data[type] || [];
    const index = records.findIndex(record => record.id === String(id));
    
    if (index === -1) {
      return null;
    }

    records[index] = {
      ...records[index],
      ...updates,
      id: String(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    return records[index];
  }

  /**
   * Delete a record
   */
  delete(type, id) {
    const records = this.data[type] || [];
    const index = records.findIndex(record => record.id === String(id));
    
    if (index === -1) {
      return false;
    }

    records.splice(index, 1);
    return true;
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Generate a new ID for a type
   */
  generateId(type) {
    const records = this.data[type] || [];
    if (records.length === 0) {
      return '1';
    }

    // Find max numeric ID and increment
    const maxId = Math.max(...records.map(r => parseInt(r.id) || 0));
    return String(maxId + 1);
  }

  /**
   * Count records of a type
   */
  count(type, filterFn) {
    const records = this.data[type] || [];
    return filterFn ? records.filter(filterFn).length : records.length;
  }

  /**
   * Check if a record exists
   */
  exists(type, id) {
    return !!this.findById(type, id);
  }

  /**
   * Paginate results
   */
  paginate(records, { page = 1, size = 20 }) {
    const start = (page - 1) * size;
    const end = start + size;
    
    return {
      data: records.slice(start, end),
      meta: {
        page,
        size,
        total: records.length,
        totalPages: Math.ceil(records.length / size),
      }
    };
  }

  /**
   * Sort records by sort specifications
   * @param {Array} records - Records to sort
   * @param {Array|String} sortSpecs - Array of {field, order} objects or comma-separated string
   */
  sort(records, sortSpecs) {
    if (!sortSpecs || (Array.isArray(sortSpecs) && sortSpecs.length === 0)) {
      return records;
    }

    // Handle string format (legacy)
    if (typeof sortSpecs === 'string') {
      const sortFields = sortSpecs.split(',').map(s => s.trim());
      return [...records].sort((a, b) => {
        for (const field of sortFields) {
          const descending = field.startsWith('-');
          const fieldName = descending ? field.slice(1) : field;
          
          const aVal = a[fieldName];
          const bVal = b[fieldName];
          
          if (aVal < bVal) return descending ? 1 : -1;
          if (aVal > bVal) return descending ? -1 : 1;
        }
        return 0;
      });
    }

    // Handle array of {field, order} objects
    return [...records].sort((a, b) => {
      for (const spec of sortSpecs) {
        const aVal = a[spec.field];
        const bVal = b[spec.field];
        
        if (aVal < bVal) return spec.order === 'desc' ? 1 : -1;
        if (aVal > bVal) return spec.order === 'desc' ? -1 : 1;
      }
      return 0;
    });
  }

  /**
   * Filter records by query parameters
   */
  filter(records, filters) {
    return records.filter(record => {
      return Object.entries(filters).every(([key, value]) => {
        // Handle array values (e.g., status in ['published', 'draft'])
        if (Array.isArray(value)) {
          return value.includes(record[key]);
        }
        
        // Handle exact match
        return record[key] === value;
      });
    });
  }
}

// Create and export singleton instance
const store = new Store(path.join(__dirname, 'data', 'seed.json'));

module.exports = store;

