const express = require('express');
const store = require('../store');
const { userSerializer, serializeError, deserializeResource } = require('../serializers');
const { parseQueryParams } = require('../utils/query-parser');

const router = express.Router();

/**
 * GET /api/users
 * List all users with query features
 * 
 * Query params:
 * - ?page[number]=2&page[size]=10
 * - ?sort=-createdAt,username
 * - ?fields[users]=username,email
 */
router.get('/', (req, res) => {
  try {
    // Parse query parameters
    const { pagination, filters, sort, fields } = parseQueryParams(req.query);
    
    let users = store.findAll('users');
    
    // Apply filters if any
    if (Object.keys(filters).length > 0) {
      users = store.filter(users, filters);
    }

    // Apply sorting
    if (sort.length > 0) {
      users = store.sort(users, sort);
    }

    // Get total count before pagination
    const totalCount = users.length;

    // Apply pagination
    const paginatedResult = store.paginate(users, pagination);
    
    // Serialize
    const serialized = userSerializer.serializeMany(paginatedResult.data, {
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
    });

    res.json(serialized);
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * GET /api/users/:id
 * Get a single user
 * 
 * Query params:
 * - ?fields[users]=username,email
 */
router.get('/:id', (req, res) => {
  try {
    const user = store.findById('users', req.params.id);
    
    if (!user) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `User with id '${req.params.id}' not found`)
      );
    }

    // Parse query parameters
    const { fields } = parseQueryParams(req.query);

    res.json({ 
      data: userSerializer.serialize(user, { sparseFields: fields })
    });
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * POST /api/users
 * Create a new user
 */
router.post('/', (req, res) => {
  try {
    const userData = deserializeResource(req.body);
    
    // Validate required fields
    if (!userData.username || !userData.email) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required fields: username, email')
      );
    }

    // Check for duplicate username
    const existingUser = store.findBy('users', u => u.username === userData.username)[0];
    if (existingUser) {
      return res.status(409).json(
        serializeError(409, 'Conflict', `Username '${userData.username}' already exists`)
      );
    }

    const newUser = store.create('users', userData);
    
    res.status(201).json({ data: userSerializer.serialize(newUser) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * PATCH /api/users/:id
 * Update an existing user
 */
router.patch('/:id', (req, res) => {
  try {
    const updates = deserializeResource(req.body);
    
    // Check if user exists
    const existingUser = store.findById('users', req.params.id);
    if (!existingUser) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `User with id '${req.params.id}' not found`)
      );
    }

    // If updating username, check for duplicates
    if (updates.username && updates.username !== existingUser.username) {
      const duplicate = store.findBy('users', u => 
        u.username === updates.username && u.id !== req.params.id
      )[0];
      
      if (duplicate) {
        return res.status(409).json(
          serializeError(409, 'Conflict', `Username '${updates.username}' already exists`)
        );
      }
    }

    const updatedUser = store.update('users', req.params.id, updates);
    
    res.json({ data: userSerializer.serialize(updatedUser) });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete('/:id', (req, res) => {
  try {
    const user = store.findById('users', req.params.id);
    
    if (!user) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `User with id '${req.params.id}' not found`)
      );
    }

    store.delete('users', req.params.id);
    
    // Return 204 No Content on successful deletion
    res.status(204).send();
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

/**
 * GET /api/users/:id/followers
 * Get users who follow this user
 */
router.get('/:id/followers', (req, res) => {
  try {
    const user = store.findById('users', req.params.id);
    
    if (!user) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `User with id '${req.params.id}' not found`)
      );
    }

    const { pagination, sort, fields } = parseQueryParams(req.query);

    // Find all follow relationships where this user is being followed
    const follows = store.findBy('follows', f => f.followingId === req.params.id);
    
    // Get the follower users
    let followers = follows.map(f => store.findById('users', f.followerId)).filter(Boolean);

    // Apply sorting
    if (sort.length > 0) {
      followers = store.sort(followers, sort);
    }

    // Get total count before pagination
    const totalCount = followers.length;

    // Apply pagination
    const paginatedResult = store.paginate(followers, pagination);
    
    res.json(userSerializer.serializeMany(paginatedResult.data, {
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
 * GET /api/users/:id/following
 * Get users that this user follows
 */
router.get('/:id/following', (req, res) => {
  try {
    const user = store.findById('users', req.params.id);
    
    if (!user) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `User with id '${req.params.id}' not found`)
      );
    }

    const { pagination, sort, fields } = parseQueryParams(req.query);

    // Find all follow relationships where this user is the follower
    const follows = store.findBy('follows', f => f.followerId === req.params.id);
    
    // Get the users being followed
    let following = follows.map(f => store.findById('users', f.followingId)).filter(Boolean);

    // Apply sorting
    if (sort.length > 0) {
      following = store.sort(following, sort);
    }

    // Get total count before pagination
    const totalCount = following.length;

    // Apply pagination
    const paginatedResult = store.paginate(following, pagination);
    
    res.json(userSerializer.serializeMany(paginatedResult.data, {
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
 * POST /api/users/:id/follow
 * Follow a user
 * Body: { followerId: "userId" }
 */
router.post('/:id/follow', (req, res) => {
  try {
    const { followerId } = req.body;
    
    if (!followerId) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required field: followerId')
      );
    }

    // Verify both users exist
    const followingUser = store.findById('users', req.params.id);
    if (!followingUser) {
      return res.status(404).json(
        serializeError(404, 'Not Found', `User with id '${req.params.id}' not found`)
      );
    }

    const followerUser = store.findById('users', followerId);
    if (!followerUser) {
      return res.status(422).json(
        serializeError(422, 'Unprocessable Entity', `Follower with id '${followerId}' not found`)
      );
    }

    // Can't follow yourself
    if (followerId === req.params.id) {
      return res.status(422).json(
        serializeError(422, 'Unprocessable Entity', 'Cannot follow yourself')
      );
    }

    // Check if already following
    const existingFollow = store.findBy('follows', f => 
      f.followerId === followerId && f.followingId === req.params.id
    )[0];

    if (existingFollow) {
      return res.status(409).json(
        serializeError(409, 'Conflict', 'Already following this user')
      );
    }

    // Create follow relationship
    const follow = store.create('follows', {
      followerId,
      followingId: req.params.id
    });

    res.status(201).json({
      data: {
        type: 'follows',
        id: String(follow.id),
        attributes: {
          createdAt: follow.createdAt
        },
        relationships: {
          follower: { data: { type: 'users', id: String(follow.followerId) } },
          following: { data: { type: 'users', id: String(follow.followingId) } }
        }
      }
    });
  } catch (error) {
    res.status(400).json(serializeError(400, 'Bad Request', error.message));
  }
});

/**
 * DELETE /api/users/:id/follow
 * Unfollow a user
 * Body: { followerId: "userId" }
 */
router.delete('/:id/follow', (req, res) => {
  try {
    const { followerId } = req.body;
    
    if (!followerId) {
      return res.status(400).json(
        serializeError(400, 'Bad Request', 'Missing required field: followerId')
      );
    }

    // Find the follow relationship
    const follow = store.findBy('follows', f => 
      f.followerId === followerId && f.followingId === req.params.id
    )[0];

    if (!follow) {
      return res.status(404).json(
        serializeError(404, 'Not Found', 'Follow relationship not found')
      );
    }

    store.delete('follows', follow.id);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json(serializeError(500, 'Internal Server Error', error.message));
  }
});

module.exports = router;

