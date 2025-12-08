const express = require('express');
const store = require('../store');
const { tagSerializer, serializeError, deserializeResource } = require('../serializers');
const { parseQueryParams } = require('../utils/query-parser');

const router = express.Router();

/**
 * GET /api/tags
 * List all tags with query features
 * 
 * Query params:
 * - ?page[number]=1&page[size]=20
 * - ?sort=-postCount,name
 * - ?fields[tags]=name,slug
 */
router.get('/', (req, res) => {
  try {
    // Parse query parameters
    const { pagination, filters, sort, fields } = parseQueryParams(req.query);
    
    let tags = store.findAll('tags');
    
    // Apply filters if any
    if (Object.keys(filters).length > 0) {
      tags = store.filter(tags, filters);
    }

    // Apply sorting
    if (sort.length > 0) {
      tags = store.sort(tags, sort);
    }

    // Get total count before pagination
    const totalCount = tags.length;

    // Apply pagination
    const paginatedResult = store.paginate(tags, pagination);
    
    res.json(tagSerializer.serializeMany(paginatedResult.data, {
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
 * GET /api/tags/:id
 * Get a single tag
 */
router.get('/:id', (req, res) => {
  try {
    const tag = store.findById('tags', req.params.id);
    
    if (!tag) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Tag with id '${req.params.id}' not found`)
      );
    }

    res.json({ data: tagSerializer.serialize(tag) });
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * POST /api/tags
 * Create a new tag
 */
router.post('/', (req, res) => {
  try {
    const tagData = deserializeResource(req.body);
    
    // Validate required fields
    if (!tagData.name) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required field: name')
      );
    }

    // Check for duplicate slug
    if (tagData.slug) {
      const existing = store.findBy('tags', t => t.slug === tagData.slug)[0];
      if (existing) {
        return res.status(409).json(
          serializeError(409, 'Conflict', `Tag with slug '${tagData.slug}' already exists`)
        );
      }
    } else {
      // Generate slug from name
      tagData.slug = tagData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Set defaults
    tagData.postCount = 0;

    const newTag = store.create('tags', tagData);
    
    res.status(201).json({ data: tagSerializer.serialize(newTag) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * PATCH /api/tags/:id
 * Update an existing tag
 */
router.patch('/:id', (req, res) => {
  try {
    const updates = deserializeResource(req.body);
    
    // Check if tag exists
    const existingTag = store.findById('tags', req.params.id);
    if (!existingTag) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Tag with id '${req.params.id}' not found`)
      );
    }

    // If updating slug, check for duplicates
    if (updates.slug && updates.slug !== existingTag.slug) {
      const duplicate = store.findBy('tags', t => 
        t.slug === updates.slug && t.id !== req.params.id
      )[0];
      
      if (duplicate) {
        return res.status(409).json(
          serializeError(409, 'Conflict', `Tag with slug '${updates.slug}' already exists`)
        );
      }
    }

    const updatedTag = store.update('tags', req.params.id, updates);
    
    res.json({ data: tagSerializer.serialize(updatedTag) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * DELETE /api/tags/:id
 * Delete a tag
 */
router.delete('/:id', (req, res) => {
  try {
    const tag = store.findById('tags', req.params.id);
    
    if (!tag) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Tag with id '${req.params.id}' not found`)
      );
    }

    // Note: Unlike categories, we allow deleting tags even if posts use them
    // In a real app, you might want to remove the tag from all posts first
    store.delete('tags', req.params.id);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

module.exports = router;

