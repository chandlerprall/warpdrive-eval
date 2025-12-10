const express = require('express');
const store = require('../store');
const { serializeError, deserializeResource } = require('../serializers');
const { parseQueryParams } = require('../utils/query-parser');

const router = express.Router();

/**
 * Serialize a like (with polymorphic relationship)
 */
function serializeLike(like, options = {}) {
  const resource = {
    type: 'likes',
    id: String(like.id),
    attributes: {
      likeableType: like.likeableType,
      createdAt: like.createdAt
    },
    relationships: {
      user: {
        data: { type: 'users', id: String(like.userId) }
      },
      // Polymorphic relationship!
      likeable: {
        data: { 
          type: like.likeableType === 'post' ? 'posts' : 'comments', 
          id: String(like.likeableId) 
        }
      }
    }
  };

  // Apply sparse fieldsets if specified
  if (options.sparseFields && options.sparseFields.likes) {
    const allowedFields = options.sparseFields.likes;
    const filteredAttrs = {};
    Object.keys(resource.attributes).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredAttrs[key] = resource.attributes[key];
      }
    });
    resource.attributes = filteredAttrs;
  }

  return resource;
}

/**
 * GET /api/likes
 * List all likes
 * 
 * Query params:
 * - ?filter[userId]=1 - Filter by user
 * - ?filter[likeableType]=post - Filter by type (post or comment)
 * - ?filter[likeableId]=1 - Filter by specific resource
 * - ?page[number]=1&page[size]=20
 * - ?sort=-createdAt
 */
router.get('/', (req, res) => {
  try {
    const { pagination, filters, sort, fields } = parseQueryParams(req.query);
    
    let likes = store.findAll('likes');
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      likes = store.filter(likes, filters);
    }

    // Apply sorting
    if (sort.length > 0) {
      likes = store.sort(likes, sort);
    }

    // Get total count before pagination
    const totalCount = likes.length;

    // Apply pagination
    const paginatedResult = store.paginate(likes, pagination);
    
    res.json({
      data: paginatedResult.data.map(l => serializeLike(l, { sparseFields: fields })),
      meta: {
        count: paginatedResult.data.length,
        total: totalCount,
        page: {
          number: pagination.page,
          size: pagination.size,
          totalPages: paginatedResult.meta.totalPages
        }
      }
    });
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * GET /api/likes/:id
 * Get a single like
 */
router.get('/:id', (req, res) => {
  try {
    const like = store.findById('likes', req.params.id);
    
    if (!like) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Like with id '${req.params.id}' not found`)
      );
    }

    const { fields } = parseQueryParams(req.query);

    res.json({ data: serializeLike(like, { sparseFields: fields }) });
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * POST /api/likes
 * Create a new like (for a post or comment)
 */
router.post('/', (req, res) => {
  try {
    const likeData = deserializeResource(req.body);
    
    // Validate required fields
    if (!likeData.userId || !likeData.likeableType || !likeData.likeableId) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required fields: userId, likeableType, likeableId')
      );
    }

    // Validate likeableType
    if (!['post', 'comment'].includes(likeData.likeableType)) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'likeableType must be "post" or "comment"')
      );
    }

    // Verify user exists
    const user = store.findById('users', likeData.userId);
    if (!user) {
      return res.status(422).json(
        serializeError(422, 'Unprocessable Entity', `User with id '${likeData.userId}' not found`)
      );
    }

    // Verify likeable resource exists
    const resourceType = likeData.likeableType === 'post' ? 'posts' : 'comments';
    const likeable = store.findById(resourceType, likeData.likeableId);
    if (!likeable) {
      return res.status(422).json(
        serializeError(422, 'Unprocessable Entity', `${likeData.likeableType} with id '${likeData.likeableId}' not found`)
      );
    }

    // Check for duplicate like
    const existingLike = store.findBy('likes', l => 
      l.userId === likeData.userId &&
      l.likeableType === likeData.likeableType &&
      l.likeableId === likeData.likeableId
    )[0];

    if (existingLike) {
      return res.status(409).json(
        serializeError(409, 'Conflict', 'User has already liked this resource')
      );
    }

    const newLike = store.create('likes', likeData);
    
    // Update like count on the likeable resource
    store.update(resourceType, likeData.likeableId, {
      likeCount: likeable.likeCount + 1
    });

    res.status(201).json({ data: serializeLike(newLike) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * DELETE /api/likes/:id
 * Remove a like
 */
router.delete('/:id', (req, res) => {
  try {
    const like = store.findById('likes', req.params.id);
    
    if (!like) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Like with id '${req.params.id}' not found`)
      );
    }

    // Update like count on the likeable resource
    const resourceType = like.likeableType === 'post' ? 'posts' : 'comments';
    const likeable = store.findById(resourceType, like.likeableId);
    if (likeable) {
      store.update(resourceType, like.likeableId, {
        likeCount: Math.max(0, likeable.likeCount - 1)
      });
    }

    store.delete('likes', req.params.id);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * POST /api/posts/:postId/like
 * Like a specific post (convenience endpoint)
 */
router.post('/posts/:postId/like', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required field: userId')
      );
    }

    // Create the like using the main POST logic
    req.body = {
      data: {
        type: 'likes',
        attributes: {
          userId,
          likeableType: 'post',
          likeableId: req.params.postId
        }
      }
    };

    // Forward to main POST handler
    return router.stack.find(layer => 
      layer.route && layer.route.path === '/' && layer.route.methods.post
    ).route.stack[0].handle(req, res);
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * POST /api/comments/:commentId/like
 * Like a specific comment (convenience endpoint)
 */
router.post('/comments/:commentId/like', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required field: userId')
      );
    }

    // Create the like using the main POST logic
    req.body = {
      data: {
        type: 'likes',
        attributes: {
          userId,
          likeableType: 'comment',
          likeableId: req.params.commentId
        }
      }
    };

    // Forward to main POST handler
    return router.stack.find(layer => 
      layer.route && layer.route.path === '/' && layer.route.methods.post
    ).route.stack[0].handle(req, res);
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

module.exports = router;

