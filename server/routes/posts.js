const express = require('express');
const store = require('../store');
const { postSerializer, serializeError, deserializeResource } = require('../serializers');
const { parseQueryParams } = require('../utils/query-parser');
const { loadIncluded } = require('../utils/sideload');

const router = express.Router();

/**
 * GET /api/posts
 * List all posts with query features
 * 
 * Query params:
 * - ?filter[status]=published&filter[authorId]=1
 * - ?page[number]=2&page[size]=10
 * - ?sort=-publishedAt,title
 * - ?include=author,category,tags
 * - ?fields[posts]=title,status&fields[users]=username
 */
router.get('/', (req, res) => {
  try {
    // Parse all query parameters
    const { pagination, filters, sort, include, fields } = parseQueryParams(req.query);
    
    let posts = store.findAll('posts');
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      posts = store.filter(posts, filters);
    }

    // Apply sorting
    if (sort.length > 0) {
      posts = store.sort(posts, sort);
    }

    // Get total count before pagination
    const totalCount = posts.length;

    // Apply pagination
    const paginatedResult = store.paginate(posts, pagination);
    
    // Serialize primary resources
    const serialized = postSerializer.serializeMany(paginatedResult.data, {
      sparseFields: fields
    });

    // Load included resources if requested
    if (include.length > 0) {
      const included = loadIncluded(serialized.data, include, 'posts', { sparseFields: fields });
      serialized.included = included;
    }

    // Add comprehensive meta information
    serialized.meta = {
      count: paginatedResult.data.length,
      total: totalCount,
      page: {
        number: pagination.page,
        size: pagination.size,
        totalPages: paginatedResult.meta.totalPages
      }
    };

    // Add applied filters to meta if any
    if (Object.keys(filters).length > 0) {
      serialized.meta.filters = filters;
    }

    res.json(serialized);
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * GET /api/posts/:id
 * Get a single post
 * 
 * Query params:
 * - ?include=author,category,tags
 * - ?fields[posts]=title,status&fields[users]=username
 */
router.get('/:id', (req, res) => {
  try {
    const post = store.findById('posts', req.params.id);
    
    if (!post) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Post with id '${req.params.id}' not found`)
      );
    }

    // Parse query parameters
    const { include, fields } = parseQueryParams(req.query);

    // Serialize the post
    const serialized = postSerializer.serialize(post, {
      sparseFields: fields
    });

    const response = { data: serialized };

    // Load included resources if requested
    if (include.length > 0) {
      const included = loadIncluded([serialized], include, 'posts', { sparseFields: fields });
      response.included = included;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * POST /api/posts
 * Create a new post
 */
router.post('/', (req, res) => {
  try {
    const postData = deserializeResource(req.body);
    
    // Validate required fields
    if (!postData.title || !postData.authorId) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required fields: title, authorId')
      );
    }

    // Verify author exists
    const author = store.findById('users', postData.authorId);
    if (!author) {
      return res.status(422).json(
        serializeError(422, 'Unprocessable Entity', `Author with id '${postData.authorId}' not found`)
      );
    }

    // Verify category exists if provided
    if (postData.categoryId) {
      const category = store.findById('categories', postData.categoryId);
      if (!category) {
        return res.status(422).json(
          serializeError(422, 'Unprocessable Entity', `Category with id '${postData.categoryId}' not found`)
        );
      }
    }

    // Set defaults
    postData.status = postData.status || 'draft';
    postData.viewCount = 0;
    postData.likeCount = 0;
    postData.commentCount = 0;
    postData.tagIds = postData.tagIds || [];
    
    // Generate slug from title if not provided
    if (!postData.slug) {
      postData.slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const newPost = store.create('posts', postData);
    
    res.status(201).json({ data: postSerializer.serialize(newPost) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * PATCH /api/posts/:id
 * Update an existing post
 */
router.patch('/:id', (req, res) => {
  try {
    const updates = deserializeResource(req.body);
    
    // Check if post exists
    const existingPost = store.findById('posts', req.params.id);
    if (!existingPost) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Post with id '${req.params.id}' not found`)
      );
    }

    // Verify author exists if updating
    if (updates.authorId) {
      const author = store.findById('users', updates.authorId);
      if (!author) {
        return res.status(422).json(
          serializeError(422, 'Unprocessable Entity', `Author with id '${updates.authorId}' not found`)
        );
      }
    }

    // Verify category exists if updating
    if (updates.categoryId) {
      const category = store.findById('categories', updates.categoryId);
      if (!category) {
        return res.status(422).json(
          serializeError(422, 'Unprocessable Entity', `Category with id '${updates.categoryId}' not found`)
        );
      }
    }

    // If publishing for first time, set publishedAt
    if (updates.status === 'published' && existingPost.status !== 'published' && !updates.publishedAt) {
      updates.publishedAt = new Date().toISOString();
    }

    const updatedPost = store.update('posts', req.params.id, updates);
    
    res.json({ data: postSerializer.serialize(updatedPost) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post
 */
router.delete('/:id', (req, res) => {
  try {
    const post = store.findById('posts', req.params.id);
    
    if (!post) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Post with id '${req.params.id}' not found`)
      );
    }

    store.delete('posts', req.params.id);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

module.exports = router;

