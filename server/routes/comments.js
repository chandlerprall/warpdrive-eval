const express = require('express');
const store = require('../store');
const { serializeError, deserializeResource } = require('../serializers');
const { parseQueryParams } = require('../utils/query-parser');

const router = express.Router();

/**
 * Serialize a comment (with self-referential relationship handling)
 */
function serializeComment(comment, options = {}) {
  const resource = {
    type: 'comments',
    id: String(comment.id),
    attributes: {
      body: comment.body,
      likeCount: comment.likeCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    },
    relationships: {
      author: {
        data: { type: 'users', id: String(comment.authorId) }
      },
      post: {
        data: { type: 'posts', id: String(comment.postId) }
      }
    }
  };

  // Add parent comment relationship if exists (self-referential!)
  if (comment.parentCommentId) {
    resource.relationships.parentComment = {
      data: { type: 'comments', id: String(comment.parentCommentId) }
    };
  }

  // Apply sparse fieldsets if specified
  if (options.sparseFields && options.sparseFields.comments) {
    const allowedFields = options.sparseFields.comments;
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
 * GET /api/comments
 * List all comments with query features
 * 
 * Query params:
 * - ?filter[postId]=1 - Filter by post
 * - ?filter[parentCommentId]=null - Get only top-level comments
 * - ?page[number]=1&page[size]=20
 * - ?sort=-createdAt
 */
router.get('/', (req, res) => {
  try {
    const { pagination, filters, sort, fields } = parseQueryParams(req.query);
    
    let comments = store.findAll('comments');
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      // Handle special case: filter by null parentCommentId
      const processedFilters = { ...filters };
      if (filters.parentCommentId === 'null') {
        comments = comments.filter(c => c.parentCommentId === null);
        delete processedFilters.parentCommentId;
      }
      
      if (Object.keys(processedFilters).length > 0) {
        comments = store.filter(comments, processedFilters);
      }
    }

    // Apply sorting
    if (sort.length > 0) {
      comments = store.sort(comments, sort);
    }

    // Get total count before pagination
    const totalCount = comments.length;

    // Apply pagination
    const paginatedResult = store.paginate(comments, pagination);
    
    // Serialize
    const serialized = {
      data: paginatedResult.data.map(c => serializeComment(c, { sparseFields: fields })),
      meta: {
        count: paginatedResult.data.length,
        total: totalCount,
        page: {
          number: pagination.page,
          size: pagination.size,
          totalPages: paginatedResult.meta.totalPages
        }
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
 * GET /api/comments/:id
 * Get a single comment
 * 
 * Query params:
 * - ?include=replies - Include child comments
 */
router.get('/:id', (req, res) => {
  try {
    const comment = store.findById('comments', req.params.id);
    
    if (!comment) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Comment with id '${req.params.id}' not found`)
      );
    }

    const { include, fields } = parseQueryParams(req.query);
    const response = { data: serializeComment(comment, { sparseFields: fields }) };

    // Include replies if requested
    if (include.includes('replies')) {
      const replies = store.findBy('comments', c => c.parentCommentId === req.params.id);
      response.included = replies.map(r => serializeComment(r, { sparseFields: fields }));
    }

    res.json(response);
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * POST /api/comments
 * Create a new comment (top-level or reply)
 */
router.post('/', (req, res) => {
  try {
    const commentData = deserializeResource(req.body);
    
    // Validate required fields
    if (!commentData.body || !commentData.authorId || !commentData.postId) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required fields: body, authorId, postId')
      );
    }

    // Verify author exists
    const author = store.findById('users', commentData.authorId);
    if (!author) {
      return res.status(422).json(
        serializeError(422, 'Unprocessable Entity', `Author with id '${commentData.authorId}' not found`)
      );
    }

    // Verify post exists
    const post = store.findById('posts', commentData.postId);
    if (!post) {
      return res.status(422).json(
        serializeError(422, 'Unprocessable Entity', `Post with id '${commentData.postId}' not found`)
      );
    }

    // Verify parent comment exists if specified
    if (commentData.parentCommentId) {
      const parentComment = store.findById('comments', commentData.parentCommentId);
      if (!parentComment) {
        return res.status(422).json(
          serializeError(422, 'Unprocessable Entity', `Parent comment with id '${commentData.parentCommentId}' not found`)
        );
      }

      // Verify parent comment is on the same post
      if (parentComment.postId !== commentData.postId) {
        return res.status(422).json(
          serializeError(422, 'Unprocessable Entity', 'Parent comment must be on the same post')
        );
      }
    }

    // Set defaults
    commentData.likeCount = 0;
    commentData.parentCommentId = commentData.parentCommentId || null;

    const newComment = store.create('comments', commentData);
    
    // Update post comment count
    store.update('posts', commentData.postId, {
      commentCount: post.commentCount + 1
    });

    res.status(201).json({ data: serializeComment(newComment) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * PATCH /api/comments/:id
 * Update an existing comment
 */
router.patch('/:id', (req, res) => {
  try {
    const updates = deserializeResource(req.body);
    
    const existingComment = store.findById('comments', req.params.id);
    if (!existingComment) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Comment with id '${req.params.id}' not found`)
      );
    }

    // Only allow updating body (not relationships)
    const allowedUpdates = { body: updates.body };

    const updatedComment = store.update('comments', req.params.id, allowedUpdates);
    
    res.json({ data: serializeComment(updatedComment) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * DELETE /api/comments/:id
 * Delete a comment and all its replies (cascade)
 */
router.delete('/:id', (req, res) => {
  try {
    const comment = store.findById('comments', req.params.id);
    
    if (!comment) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Comment with id '${req.params.id}' not found`)
      );
    }

    // Find and delete all replies (recursive deletion)
    const deleteCommentAndReplies = (commentId) => {
      const replies = store.findBy('comments', c => c.parentCommentId === commentId);
      replies.forEach(reply => {
        deleteCommentAndReplies(reply.id); // Recurse
      });
      store.delete('comments', commentId);
    };

    deleteCommentAndReplies(req.params.id);

    // Update post comment count
    const post = store.findById('posts', comment.postId);
    if (post) {
      const remainingComments = store.findBy('comments', c => c.postId === comment.postId);
      store.update('posts', comment.postId, {
        commentCount: remainingComments.length
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * GET /api/comments/:id/replies
 * Get all replies to a comment (direct children only)
 */
router.get('/:id/replies', (req, res) => {
  try {
    const comment = store.findById('comments', req.params.id);
    
    if (!comment) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `Comment with id '${req.params.id}' not found`)
      );
    }

    const { pagination, sort, fields } = parseQueryParams(req.query);
    
    let replies = store.findBy('comments', c => c.parentCommentId === req.params.id);

    // Apply sorting
    if (sort.length > 0) {
      replies = store.sort(replies, sort);
    }

    // Get total count before pagination
    const totalCount = replies.length;

    // Apply pagination
    const paginatedResult = store.paginate(replies, pagination);
    
    res.json({
      data: paginatedResult.data.map(c => serializeComment(c, { sparseFields: fields })),
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

module.exports = router;

