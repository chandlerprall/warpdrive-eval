const express = require('express');
const store = require('../store');
const { categorySerializer, serializeError, deserializeResource } = require('../serializers');
const { parseQueryParams } = require('../utils/query-parser');

const router = express.Router();

/**
 * GET /api/categories
 * List all categories with query features
 * 
 * Query params:
 * - ?page[number]=1&page[size]=20
 * - ?sort=-postCount,name
 * - ?fields[categories]=name,slug
 */
router.get('/', (req, res) => {
  try {
    // Parse query parameters
    const { pagination, filters, sort, fields } = parseQueryParams(req.query);
    
    let categories = store.findAll('categories');
    
    // Apply filters if any
    if (Object.keys(filters).length > 0) {
      categories = store.filter(categories, filters);
    }

    // Apply sorting
    if (sort.length > 0) {
      categories = store.sort(categories, sort);
    }

    // Get total count before pagination
    const totalCount = categories.length;

    // Apply pagination
    const paginatedResult = store.paginate(categories, pagination);
    
    res.json(categorySerializer.serializeMany(paginatedResult.data, {
      sparseFields: fields,
      meta: {
        count: paginatedResult.data.length,
        total: totalCount,
        page: {
          number: pagination.page,
          size: pagination.size,
          totalPages: paginatedResult.meta.totalPages
        }
      }
    }));
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * GET /api/categories/:id
 * Get a single category
 */
router.get('/:id', (req, res) => {
  try {
    const category = store.findById('categories', req.params.id);
    
    if (!category) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Category with id '${req.params.id}' not found`)
      );
    }

    res.json({ data: categorySerializer.serialize(category) });
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * POST /api/categories
 * Create a new category
 */
router.post('/', (req, res) => {
  try {
    const categoryData = deserializeResource(req.body);
    
    // Validate required fields
    if (!categoryData.name) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required field: name')
      );
    }

    // Check for duplicate slug
    if (categoryData.slug) {
      const existing = store.findBy('categories', c => c.slug === categoryData.slug)[0];
      if (existing) {
        return res.status(409).json(
          serializeError(409, 'Conflict', `Category with slug '${categoryData.slug}' already exists`)
        );
      }
    } else {
      // Generate slug from name
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Set defaults
    categoryData.postCount = 0;

    const newCategory = store.create('categories', categoryData);
    
    res.status(201).json({ data: categorySerializer.serialize(newCategory) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * PATCH /api/categories/:id
 * Update an existing category
 */
router.patch('/:id', (req, res) => {
  try {
    const updates = deserializeResource(req.body);
    
    // Check if category exists
    const existingCategory = store.findById('categories', req.params.id);
    if (!existingCategory) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Category with id '${req.params.id}' not found`)
      );
    }

    // If updating slug, check for duplicates
    if (updates.slug && updates.slug !== existingCategory.slug) {
      const duplicate = store.findBy('categories', c => 
        c.slug === updates.slug && c.id !== req.params.id
      )[0];
      
      if (duplicate) {
        return res.status(409).json(
          serializeError(409, 'Conflict', `Category with slug '${updates.slug}' already exists`)
        );
      }
    }

    const updatedCategory = store.update('categories', req.params.id, updates);
    
    res.json({ data: categorySerializer.serialize(updatedCategory) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * DELETE /api/categories/:id
 * Delete a category
 */
router.delete('/:id', (req, res) => {
  try {
    const category = store.findById('categories', req.params.id);
    
    if (!category) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Category with id '${req.params.id}' not found`)
      );
    }

    // Check if any posts use this category
    const postsWithCategory = store.findBy('posts', p => p.categoryId === req.params.id);
    if (postsWithCategory.length > 0) {
      return res.status(409).json(
        serializeError(
          409, 
          'Conflict', 
          `Cannot delete category: ${postsWithCategory.length} post(s) are using it`,
          { relatedPosts: postsWithCategory.length }
        )
      );
    }

    store.delete('categories', req.params.id);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

module.exports = router;

