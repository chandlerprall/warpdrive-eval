# Phase 3 Complete! 🎉

## What Was Built

Phase 3 adds **complex relationship patterns** that showcase WarpDrive's most advanced capabilities: self-referential relationships, polymorphic relationships, and many-to-many self-joins.

### ✅ Completed Features

#### 1. **Comment Threading** (Self-Referential Relationships)
Comments can reply to other comments, creating nested conversation threads.

**Features:**
- ✅ Top-level comments (no parent)
- ✅ Reply to comments (set parentCommentId)
- ✅ Unlimited nesting depth
- ✅ Cascade delete (deleting parent deletes all replies)
- ✅ Get replies to specific comment
- ✅ Filter for top-level only

**Example:**
```bash
# Create a reply to comment 1
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "comments",
      "attributes": {
        "body": "This is a reply"
      },
      "relationships": {
        "author": { "data": { "type": "users", "id": "2" } },
        "post": { "data": { "type": "posts", "id": "1" } },
        "parentComment": { "data": { "type": "comments", "id": "1" } }
      }
    }
  }'

# Get comment with its replies
curl "http://localhost:3000/api/comments/1?include=replies"

# Get all replies to a comment
curl "http://localhost:3000/api/comments/1/replies"

# Get only top-level comments
curl "http://localhost:3000/api/comments?filter[postId]=1&filter[parentCommentId]=null"
```

**Response structure:**
```json
{
  "data": {
    "type": "comments",
    "id": "1",
    "attributes": {
      "body": "Great introduction!",
      "likeCount": 5,
      "createdAt": "2024-11-02T10:00:00Z"
    },
    "relationships": {
      "author": { "data": { "type": "users", "id": "2" } },
      "post": { "data": { "type": "posts", "id": "1" } }
      // No parentComment = top-level
    }
  },
  "included": [
    {
      "type": "comments",
      "id": "2",
      "attributes": { "body": "Thanks!" },
      "relationships": {
        "author": { "data": { "type": "users", "id": "1" } },
        "post": { "data": { "type": "posts", "id": "1" } },
        "parentComment": { "data": { "type": "comments", "id": "1" } }
      }
    }
  ]
}
```

---

#### 2. **Polymorphic Likes** (Like Posts OR Comments)
A single `Like` resource that can reference either a post or a comment.

**Features:**
- ✅ Like posts (`likeableType: 'post'`)
- ✅ Like comments (`likeableType: 'comment'`)
- ✅ Single table for all likes
- ✅ Polymorphic relationship in JSON:API
- ✅ Duplicate prevention (can't like twice)
- ✅ Auto-update like counts

**Example:**
```bash
# Like a post
curl -X POST http://localhost:3000/api/likes \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "likes",
      "attributes": {
        "userId": "2",
        "likeableType": "post",
        "likeableId": "1"
      }
    }
  }'

# Like a comment
curl -X POST http://localhost:3000/api/likes \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "likes",
      "attributes": {
        "userId": "2",
        "likeableType": "comment",
        "likeableId": "5"
      }
    }
  }'

# Get all post likes
curl "http://localhost:3000/api/likes?filter[likeableType]=post"

# Get all comment likes  
curl "http://localhost:3000/api/likes?filter[likeableType]=comment"

# Get all likes by a user (posts AND comments)
curl "http://localhost:3000/api/likes?filter[userId]=2"
```

**Response structure (polymorphic!):**
```json
{
  "data": {
    "type": "likes",
    "id": "1",
    "attributes": {
      "likeableType": "post",
      "createdAt": "2024-11-02T10:00:00Z"
    },
    "relationships": {
      "user": { "data": { "type": "users", "id": "2" } },
      "likeable": { 
        "data": { 
          "type": "posts",  // ← Polymorphic! Could be "comments"
          "id": "1" 
        } 
      }
    }
  }
}
```

---

#### 3. **User Follows** (Many-to-Many Self-Join)
Users can follow other users, creating a social network graph.

**Features:**
- ✅ Follow/unfollow users
- ✅ Get followers (users who follow you)
- ✅ Get following (users you follow)
- ✅ Self-follow prevention
- ✅ Duplicate follow prevention
- ✅ Bidirectional queries

**Example:**
```bash
# Follow a user
curl -X POST "http://localhost:3000/api/users/1/follow" \
  -H "Content-Type: application/json" \
  -d '{"followerId": "2"}'

# Unfollow
curl -X DELETE "http://localhost:3000/api/users/1/follow" \
  -H "Content-Type: application/json" \
  -d '{"followerId": "2"}'

# Get followers (who follows user 1?)
curl "http://localhost:3000/api/users/1/followers"

# Get following (who does user 1 follow?)
curl "http://localhost:3000/api/users/1/following"
```

**Response structure:**
```json
{
  "data": [
    {
      "type": "users",
      "id": "2",
      "attributes": {
        "username": "krystan",
        "displayName": "Krystan HuffMenne"
      }
    },
    {
      "type": "users",
      "id": "3",
      "attributes": {
        "username": "rich",
        "displayName": "Rich Glazerman"
      }
    }
  ],
  "meta": {
    "count": 2,
    "total": 4,
    "page": {
      "number": 1,
      "size": 20,
      "totalPages": 1
    }
  }
}
```

---

## New Endpoints

### Comments (`/api/comments`)
- `GET /api/comments` - List with filtering, pagination, sorting
- `GET /api/comments/:id` - Get single comment
- `GET /api/comments/:id?include=replies` - Get with replies
- `GET /api/comments/:id/replies` - Get direct replies
- `POST /api/comments` - Create comment (top-level or reply)
- `PATCH /api/comments/:id` - Update comment body
- `DELETE /api/comments/:id` - Delete (cascades to replies)

**Query examples:**
```bash
# Top-level comments only
/api/comments?filter[postId]=1&filter[parentCommentId]=null

# All comments on a post
/api/comments?filter[postId]=1

# Recent comments first
/api/comments?sort=-createdAt&page[size]=10
```

### Likes (`/api/likes`)
- `GET /api/likes` - List with filtering, pagination
- `GET /api/likes/:id` - Get single like
- `POST /api/likes` - Create like (post or comment)
- `DELETE /api/likes/:id` - Remove like

**Query examples:**
```bash
# All post likes
/api/likes?filter[likeableType]=post

# All comment likes
/api/likes?filter[likeableType]=comment

# User's likes (both types!)
/api/likes?filter[userId]=2

# Likes on specific post
/api/likes?filter[likeableType]=post&filter[likeableId]=1
```

### User Follow Endpoints
- `GET /api/users/:id/followers` - Get followers (with pagination, sorting)
- `GET /api/users/:id/following` - Get following (with pagination, sorting)
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

---

## Seed Data

Phase 3 includes realistic seed data:
- **10 comments** - Mix of top-level and replies (up to 3 levels deep)
- **15 likes** - 10 post likes, 5 comment likes
- **12 follow relationships** - Creating a social network

**Example comment thread:**
```
Comment 1 (by user 2): "Great introduction!"
  ↳ Comment 2 (by user 1): "Thanks! Let me know if you have questions..."

Comment 3 (by user 5): "This is exactly what I needed."
  ↳ Comment 4 (by user 3): "How does this compare to Solid.js?"
    ↳ Comment 5 (by user 1): "Similar concepts, but WarpDrive is focused..."
```

**Social graph:**
- Chris (user 1): 4 followers, following 3
- Everyone follows Chris (he's the project lead!)
- Users follow each other creating realistic network

---

## New Files Created

### Routes
- `routes/comments.js` - Comment CRUD with threading
- `routes/likes.js` - Polymorphic likes
- Updated `routes/users.js` - Follow/unfollow functionality

### Tests
- `test-phase3.sh` - Comprehensive Phase 3 test suite

### Data
- Updated `data/seed.json` - Added comments, likes, follows

---

## Testing

Run the Phase 3 test suite:
```bash
./test-phase3.sh
```

**Test Coverage:**
- ✅ Comment threading (nested replies)
- ✅ Cascade delete for comments
- ✅ Polymorphic likes (posts AND comments)
- ✅ User follows (followers/following)
- ✅ Self-follow prevention
- ✅ Duplicate prevention (likes, follows)
- ✅ Complex relationship queries
- ✅ Edge cases and error handling

---

## Complex Relationship Patterns Demonstrated

### 1. Self-Referential Relationship (Comments)
A resource that references itself:
```
Comment → parentComment (Comment)
Comment → replies (many Comments)
```

**WarpDrive Challenge:**
- Schema must handle circular references
- Need to prevent infinite loops when loading
- Cascade operations (delete parent → delete children)

### 2. Polymorphic Relationship (Likes)
A resource that can reference multiple types:
```
Like → likeable (Post OR Comment)
```

**WarpDrive Challenge:**
- Single relationship field, multiple possible types
- Type information stored in data (`likeableType`)
- Need to load correct resource based on type

### 3. Many-to-Many Self-Join (Follows)
A resource with two relationships to the same type:
```
User → followers (many Users)
User → following (many Users)
```

**WarpDrive Challenge:**
- Same model referenced twice
- Bidirectional navigation
- Prevent self-reference

---

## Real-World Use Cases

### Use Case 1: Discussion Forum
```javascript
// Frontend: Load post with threaded comments
const response = await fetch(
  '/api/posts/1?include=comments'
);

// Then for each top-level comment, load replies
for (const comment of topLevelComments) {
  const replies = await fetch(
    `/api/comments/${comment.id}/replies?sort=createdAt`
  );
}
```

### Use Case 2: Social Activity Feed
```javascript
// Frontend: Get user's activity (posts they liked, comments they liked)
const allLikes = await fetch(
  `/api/likes?filter[userId]=${userId}&include=likeable`
);

// WarpDrive will:
// 1. Load likes
// 2. Sideload both posts AND comments
// 3. Handle polymorphic relationship correctly
```

### Use Case 3: User Profile
```javascript
// Frontend: Display user's social network
const [followers, following] = await Promise.all([
  fetch(`/api/users/${userId}/followers?page[size]=10`),
  fetch(`/api/users/${userId}/following?page[size]=10`)
]);

// Show mutual follows
const mutualFollows = followers.data.filter(follower =>
  following.data.some(f => f.id === follower.id)
);
```

---

## What This Enables for WarpDrive Testing

Your team can now test WarpDrive's most advanced features:

### 1. **Self-Referential Models**
- Define schemas with circular references
- Handle recursive data structures
- Test cache updates with nested changes

### 2. **Polymorphic Relationships**
- Single relationship to multiple types
- Type-aware sideloading
- Unified queries across types

### 3. **Many-to-Many Self-Joins**
- Bidirectional relationships
- Social graph traversal
- Complex filtering and sorting

### 4. **Cascade Operations**
- Delete propagation through relationships
- Maintaining referential integrity
- Update count caching

### 5. **Complex Queries**
- Filter by relationship type
- Include polymorphic relationships
- Navigate self-referential trees

---

## Performance Notes

### Comment Threading
- Cascade delete is recursive (O(n) where n = total replies)
- Loading replies is O(1) per level (direct children only)
- No N+1 queries when properly implemented in WarpDrive

### Polymorphic Likes
- Single table = efficient storage
- Type filtering is O(n) but fast with indexing
- No joins needed for basic operations

### User Follows
- Bidirectional queries are separate (not joined)
- Pagination crucial for users with many follows
- Mutual follows require client-side filtering

---

## Edge Cases Handled

### Comments
- ✅ Reply to non-existent comment → 422 error
- ✅ Reply to comment on different post → 422 error
- ✅ Delete comment cascades to all replies
- ✅ Orphaned comments prevented

### Likes
- ✅ Like non-existent resource → 422 error
- ✅ Duplicate like → 409 conflict
- ✅ Invalid likeableType → 400 error
- ✅ Like counts auto-update

### Follows
- ✅ Self-follow → 422 error
- ✅ Duplicate follow → 409 conflict
- ✅ Follow non-existent user → 404 error
- ✅ Bidirectional consistency maintained

---

## Database Equivalents

For understanding how this maps to real databases:

### Comment Threading (Self-Referential)
**SQL:**
```sql
CREATE TABLE comments (
  id INT PRIMARY KEY,
  parent_comment_id INT REFERENCES comments(id),
  -- recursive foreign key!
);
```

### Polymorphic Likes
**SQL:**
```sql
CREATE TABLE likes (
  id INT PRIMARY KEY,
  user_id INT,
  likeable_type VARCHAR(50),  -- 'post' or 'comment'
  likeable_id INT,            -- id in posts OR comments table
  -- polymorphic foreign key!
);
```

### User Follows (Many-to-Many Self-Join)
**SQL:**
```sql
CREATE TABLE follows (
  id INT PRIMARY KEY,
  follower_id INT REFERENCES users(id),
  following_id INT REFERENCES users(id),
  -- both reference same table!
);
```

---

## API Summary

**Total Endpoints:** 30+

**Resources:** 8
- Users (5 seed records)
- Posts (6 seed records)
- Categories (4 seed records)
- Tags (7 seed records)
- **Comments (10 seed records)** ← Phase 3
- **Likes (15 seed records)** ← Phase 3
- **Follows (12 seed records)** ← Phase 3

**Relationship Types Supported:**
- ✅ Belongs-to (Post → Author)
- ✅ Has-many (Post → Comments)
- ✅ Many-to-many (Post → Tags)
- ✅ **Self-referential (Comment → Comment)** ← Phase 3
- ✅ **Polymorphic (Like → Post/Comment)** ← Phase 3
- ✅ **Self-join (User → User)** ← Phase 3

---

## Ready to Use! 🚀

**Phase 3 is complete** with the most advanced relationship patterns!

Your team can now:
- ✅ Test self-referential relationships (comment trees)
- ✅ Test polymorphic relationships (like posts or comments)
- ✅ Test many-to-many self-joins (user follows)
- ✅ Build complex social features
- ✅ Handle cascade operations
- ✅ Navigate relationship graphs

**All three phases complete - the API is production-ready for comprehensive WarpDrive testing!** 🌌

