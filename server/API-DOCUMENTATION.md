# WarpDrive Test API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000`  
**Format:** JSON:API v1.0

---

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Query Parameters](#query-parameters)
- [Resources](#resources)
  - [Users](#users)
  - [Posts](#posts)
  - [Categories](#categories)
  - [Tags](#tags)
  - [Comments](#comments)
  - [Likes](#likes)
- [Common Patterns](#common-patterns)
- [Examples by Use Case](#examples-by-use-case)

---

## Getting Started

### Base URL
All API requests should be made to:
```
http://localhost:3000/api
```

### Content Type
All requests must include:
```http
Content-Type: application/json
```

### CORS
CORS is enabled for all origins. No special headers required.

### Data Reset
For testing, you can reset all data to initial state:
```bash
POST http://localhost:3000/reset
```

---

## Authentication

**No authentication required.** This is a testing/learning API.

All endpoints are publicly accessible.

---

## Request Format

All write operations (POST, PATCH) must follow JSON:API format:

### Create Resource
```json
{
  "data": {
    "type": "posts",
    "attributes": {
      "title": "My Post",
      "body": "Content here..."
    },
    "relationships": {
      "author": {
        "data": { "type": "users", "id": "1" }
      }
    }
  }
}
```

### Update Resource
```json
{
  "data": {
    "type": "posts",
    "id": "1",
    "attributes": {
      "title": "Updated Title"
    }
  }
}
```

---

## Response Format

All responses follow JSON:API specification.

### Single Resource
```json
{
  "data": {
    "type": "users",
    "id": "1",
    "attributes": {
      "username": "chris",
      "email": "chris@warpdrive.io"
    },
    "relationships": {
      "posts": {
        "data": [
          { "type": "posts", "id": "1" }
        ]
      }
    }
  }
}
```

### Collection
```json
{
  "data": [
    { "type": "users", "id": "1", "attributes": {...} },
    { "type": "users", "id": "2", "attributes": {...} }
  ],
  "meta": {
    "count": 2,
    "total": 5,
    "page": {
      "number": 1,
      "size": 20,
      "totalPages": 1
    }
  }
}
```

### With Includes
```json
{
  "data": {
    "type": "posts",
    "id": "1",
    "attributes": {...},
    "relationships": {
      "author": { "data": { "type": "users", "id": "1" } }
    }
  },
  "included": [
    {
      "type": "users",
      "id": "1",
      "attributes": {
        "username": "chris",
        "email": "chris@warpdrive.io"
      }
    }
  ]
}
```

---

## Error Handling

All errors follow JSON:API error format:

```json
{
  "errors": [
    {
      "status": "404",
      "title": "Not Found",
      "detail": "User with id '999' not found"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate (username, like, follow) |
| 422 | Unprocessable | Invalid relationships |
| 500 | Server Error | Something went wrong |

---

## Query Parameters

All collection endpoints support these query parameters:

### Pagination
```
?page[number]=2&page[size]=10
```
- `page[number]` - Page number (1-indexed, default: 1)
- `page[size]` - Items per page (default: 20, max: 100)

### Sorting
```
?sort=-publishedAt,title
```
- Prefix with `-` for descending
- Comma-separated for multiple fields

### Filtering
```
?filter[status]=published&filter[authorId]=1
```
- Any field can be filtered
- Multiple filters are AND-ed together

### Includes (Sideloading)
```
?include=author,category,tags
```
- Avoid N+1 queries
- Related resources loaded in `included` section

### Sparse Fieldsets
```
?fields[posts]=title,excerpt&fields[users]=username
```
- Only return specified fields
- Reduces bandwidth by 60-80%

### Combining Parameters
```
?filter[status]=published&sort=-publishedAt&page[size]=5&include=author&fields[posts]=title,excerpt
```

---

## Resources

## Users

**Endpoints:**
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get users they follow
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user

### User Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique username |
| email | string | Yes | Email address |
| displayName | string | No | Full name |
| bio | string | No | Biography |
| avatarUrl | string | No | Profile picture URL |
| createdAt | datetime | Auto | Creation timestamp |
| updatedAt | datetime | Auto | Last update timestamp |

### List Users

**Request:**
```http
GET /api/users?page[size]=10&sort=username
```

**Response:**
```json
{
  "data": [
    {
      "type": "users",
      "id": "1",
      "attributes": {
        "username": "chris",
        "email": "chris@warpdrive.io",
        "displayName": "Chris Thoburn",
        "bio": "Project Lead for WarpDrive...",
        "avatarUrl": "https://i.pravatar.cc/150?img=12",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    }
  ],
  "meta": {
    "count": 1,
    "total": 5,
    "page": { "number": 1, "size": 10, "totalPages": 1 }
  }
}
```

### Create User

**Request:**
```http
POST /api/users
Content-Type: application/json

{
  "data": {
    "type": "users",
    "attributes": {
      "username": "johndoe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "bio": "Software developer"
    }
  }
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "type": "users",
    "id": "6",
    "attributes": {
      "username": "johndoe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "bio": "Software developer",
      "createdAt": "2024-12-08T10:00:00Z",
      "updatedAt": "2024-12-08T10:00:00Z"
    }
  }
}
```

### Get User's Followers

**Request:**
```http
GET /api/users/1/followers?page[size]=5
```

**Response:**
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
    }
  ],
  "meta": {
    "count": 1,
    "total": 4,
    "page": { "number": 1, "size": 5, "totalPages": 1 }
  }
}
```

### Follow a User

**Request:**
```http
POST /api/users/1/follow
Content-Type: application/json

{
  "followerId": "2"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "type": "follows",
    "id": "13",
    "attributes": {
      "createdAt": "2024-12-08T10:00:00Z"
    },
    "relationships": {
      "follower": { "data": { "type": "users", "id": "2" } },
      "following": { "data": { "type": "users", "id": "1" } }
    }
  }
}
```

---

## Posts

**Endpoints:**
- `GET /api/posts` - List all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Post Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Post title |
| slug | string | Auto | URL-friendly slug |
| body | string | No | Post content |
| excerpt | string | No | Short summary |
| status | enum | No | draft, published, archived (default: draft) |
| publishedAt | datetime | Auto | Publication timestamp |
| viewCount | integer | Auto | View count |
| likeCount | integer | Auto | Like count |
| commentCount | integer | Auto | Comment count |
| createdAt | datetime | Auto | Creation timestamp |
| updatedAt | datetime | Auto | Last update timestamp |

### Post Relationships

| Relationship | Type | Required | Description |
|--------------|------|----------|-------------|
| author | belongs-to | Yes | Post author (User) |
| category | belongs-to | No | Post category |
| tags | has-many | No | Post tags |

### List Posts (with filters)

**Request:**
```http
GET /api/posts?filter[status]=published&sort=-publishedAt&page[size]=10&include=author,category
```

**Response:**
```json
{
  "data": [
    {
      "type": "posts",
      "id": "1",
      "attributes": {
        "title": "Introduction to WarpDrive",
        "slug": "introduction-to-warpdrive",
        "body": "WarpDrive is the next iteration...",
        "excerpt": "Learn about WarpDrive's core features...",
        "status": "published",
        "publishedAt": "2024-11-01T10:00:00Z",
        "viewCount": 342,
        "likeCount": 45,
        "commentCount": 12,
        "createdAt": "2024-10-28T10:00:00Z",
        "updatedAt": "2024-11-01T10:00:00Z"
      },
      "relationships": {
        "author": { "data": { "type": "users", "id": "1" } },
        "category": { "data": { "type": "categories", "id": "1" } },
        "tags": {
          "data": [
            { "type": "tags", "id": "1" },
            { "type": "tags", "id": "3" }
          ]
        }
      }
    }
  ],
  "included": [
    {
      "type": "users",
      "id": "1",
      "attributes": {
        "username": "chris",
        "displayName": "Chris Thoburn"
      }
    },
    {
      "type": "categories",
      "id": "1",
      "attributes": {
        "name": "Getting Started",
        "slug": "getting-started"
      }
    }
  ],
  "meta": {
    "count": 1,
    "total": 5,
    "page": { "number": 1, "size": 10, "totalPages": 1 },
    "filters": { "status": "published" }
  }
}
```

### Create Post

**Request:**
```http
POST /api/posts
Content-Type: application/json

{
  "data": {
    "type": "posts",
    "attributes": {
      "title": "My First WarpDrive Post",
      "body": "This is the content of my post...",
      "excerpt": "A quick introduction to my post",
      "status": "published"
    },
    "relationships": {
      "author": { "data": { "type": "users", "id": "1" } },
      "category": { "data": { "type": "categories", "id": "1" } },
      "tags": {
        "data": [
          { "type": "tags", "id": "1" },
          { "type": "tags", "id": "2" }
        ]
      }
    }
  }
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "type": "posts",
    "id": "7",
    "attributes": {
      "title": "My First WarpDrive Post",
      "slug": "my-first-warpdrive-post",
      "body": "This is the content of my post...",
      "excerpt": "A quick introduction to my post",
      "status": "published",
      "publishedAt": "2024-12-08T10:00:00Z",
      "viewCount": 0,
      "likeCount": 0,
      "commentCount": 0,
      "createdAt": "2024-12-08T10:00:00Z",
      "updatedAt": "2024-12-08T10:00:00Z"
    },
    "relationships": {
      "author": { "data": { "type": "users", "id": "1" } },
      "category": { "data": { "type": "categories", "id": "1" } },
      "tags": {
        "data": [
          { "type": "tags", "id": "1" },
          { "type": "tags", "id": "2" }
        ]
      }
    }
  }
}
```

---

## Categories

**Endpoints:**
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Category Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name |
| slug | string | Auto | URL-friendly slug |
| description | string | No | Category description |
| postCount | integer | Auto | Number of posts |

### Example

**Request:**
```http
GET /api/categories?sort=name
```

**Response:**
```json
{
  "data": [
    {
      "type": "categories",
      "id": "1",
      "attributes": {
        "name": "Getting Started",
        "slug": "getting-started",
        "description": "Guides for developers new to WarpDrive",
        "postCount": 2
      }
    }
  ],
  "meta": {
    "count": 1,
    "total": 4
  }
}
```

---

## Tags

**Endpoints:**
- `GET /api/tags` - List all tags
- `GET /api/tags/:id` - Get single tag
- `POST /api/tags` - Create tag
- `PATCH /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Tag Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Tag name |
| slug | string | Auto | URL-friendly slug |
| postCount | integer | Auto | Number of posts |

---

## Comments

**Endpoints:**
- `GET /api/comments` - List all comments
- `GET /api/comments/:id` - Get single comment
- `GET /api/comments/:id?include=replies` - Get comment with replies
- `GET /api/comments/:id/replies` - Get direct replies to comment
- `POST /api/comments` - Create comment (top-level or reply)
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment (cascades to replies)

### Comment Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| body | string | Yes | Comment text |
| likeCount | integer | Auto | Like count |
| createdAt | datetime | Auto | Creation timestamp |
| updatedAt | datetime | Auto | Last update timestamp |

### Comment Relationships

| Relationship | Type | Required | Description |
|--------------|------|----------|-------------|
| author | belongs-to | Yes | Comment author (User) |
| post | belongs-to | Yes | Post being commented on |
| parentComment | belongs-to | No | Parent comment (for replies) |
| replies | has-many | - | Child comments |

### Get Top-Level Comments

**Request:**
```http
GET /api/comments?filter[postId]=1&filter[parentCommentId]=null&sort=-createdAt
```

**Response:**
```json
{
  "data": [
    {
      "type": "comments",
      "id": "1",
      "attributes": {
        "body": "Great introduction! Really excited to try WarpDrive.",
        "likeCount": 5,
        "createdAt": "2024-11-02T10:00:00Z",
        "updatedAt": "2024-11-02T10:00:00Z"
      },
      "relationships": {
        "author": { "data": { "type": "users", "id": "2" } },
        "post": { "data": { "type": "posts", "id": "1" } }
      }
    }
  ],
  "meta": {
    "count": 1,
    "total": 1,
    "filters": { "postId": "1", "parentCommentId": "null" }
  }
}
```

### Create Top-Level Comment

**Request:**
```http
POST /api/comments
Content-Type: application/json

{
  "data": {
    "type": "comments",
    "attributes": {
      "body": "This is a great post!"
    },
    "relationships": {
      "author": { "data": { "type": "users", "id": "2" } },
      "post": { "data": { "type": "posts", "id": "1" } }
    }
  }
}
```

### Create Reply to Comment

**Request:**
```http
POST /api/comments
Content-Type: application/json

{
  "data": {
    "type": "comments",
    "attributes": {
      "body": "Thanks! Glad you liked it."
    },
    "relationships": {
      "author": { "data": { "type": "users", "id": "1" } },
      "post": { "data": { "type": "posts", "id": "1" } },
      "parentComment": { "data": { "type": "comments", "id": "1" } }
    }
  }
}
```

### Get Comment with Replies

**Request:**
```http
GET /api/comments/1?include=replies
```

**Response:**
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
    }
  },
  "included": [
    {
      "type": "comments",
      "id": "2",
      "attributes": {
        "body": "Thanks! Let me know if you have questions.",
        "likeCount": 2,
        "createdAt": "2024-11-02T11:00:00Z"
      },
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

## Likes

**Endpoints:**
- `GET /api/likes` - List all likes
- `GET /api/likes/:id` - Get single like
- `POST /api/likes` - Create like
- `DELETE /api/likes/:id` - Delete like

### Like Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| likeableType | string | Yes | "post" or "comment" |
| likeableId | string | Yes | ID of post or comment |
| userId | string | Yes | User who liked |
| createdAt | datetime | Auto | Like timestamp |

### Like Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| user | belongs-to | User who liked |
| likeable | polymorphic | Post or Comment being liked |

### Get Post Likes

**Request:**
```http
GET /api/likes?filter[likeableType]=post&filter[likeableId]=1
```

**Response:**
```json
{
  "data": [
    {
      "type": "likes",
      "id": "1",
      "attributes": {
        "likeableType": "post",
        "createdAt": "2024-11-02T10:00:00Z"
      },
      "relationships": {
        "user": { "data": { "type": "users", "id": "2" } },
        "likeable": { "data": { "type": "posts", "id": "1" } }
      }
    }
  ],
  "meta": {
    "count": 1,
    "total": 3,
    "filters": { "likeableType": "post", "likeableId": "1" }
  }
}
```

### Like a Post

**Request:**
```http
POST /api/likes
Content-Type: application/json

{
  "data": {
    "type": "likes",
    "attributes": {
      "userId": "2",
      "likeableType": "post",
      "likeableId": "1"
    }
  }
}
```

**Response:** `201 Created`

### Like a Comment

**Request:**
```http
POST /api/likes
Content-Type: application/json

{
  "data": {
    "type": "likes",
    "attributes": {
      "userId": "2",
      "likeableType": "comment",
      "likeableId": "5"
    }
  }
}
```

### Get User's Likes (Polymorphic)

**Request:**
```http
GET /api/likes?filter[userId]=2
```

This returns both post likes AND comment likes for the user.

---

## Common Patterns

### Paginated List with Sorting

```javascript
// Fetch page 2 of posts, sorted by date, 10 per page
const response = await fetch(
  '/api/posts?page[number]=2&page[size]=10&sort=-publishedAt'
);
const data = await response.json();

console.log(`Page ${data.meta.page.number} of ${data.meta.page.totalPages}`);
console.log(`Showing ${data.meta.count} of ${data.meta.total} posts`);
```

### Load Resource with Relationships

```javascript
// Fetch post with author, category, and tags in one request
const response = await fetch(
  '/api/posts/1?include=author,category,tags'
);
const data = await response.json();

// Primary resource
const post = data.data;

// Related resources in 'included'
const author = data.included.find(r => r.type === 'users' && r.id === post.relationships.author.data.id);
const category = data.included.find(r => r.type === 'categories');
```

### Optimize with Sparse Fields

```javascript
// Only fetch fields you need
const response = await fetch(
  '/api/posts?fields[posts]=title,excerpt&fields[users]=username&include=author'
);
// Response is 60-80% smaller!
```

### Build Threaded Comments

```javascript
// 1. Get all comments for a post
const commentsResponse = await fetch('/api/comments?filter[postId]=1&sort=createdAt');
const allComments = commentsResponse.json();

// 2. Separate top-level and replies
const topLevel = allComments.data.filter(c => 
  !c.relationships.parentComment
);

// 3. For each top-level comment, get replies
for (const comment of topLevel) {
  const repliesResponse = await fetch(`/api/comments/${comment.id}/replies`);
  comment.replies = repliesResponse.json();
}
```

### Handle Errors Gracefully

```javascript
async function createPost(postData) {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: postData })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors[0].detail);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create post:', error.message);
    throw error;
  }
}
```

---

## Examples by Use Case

### Use Case 1: Blog Post List Page

**Goal:** Show paginated, filtered list of published posts with authors

```javascript
const response = await fetch(
  '/api/posts?' +
  'filter[status]=published&' +
  'sort=-publishedAt&' +
  'page[number]=1&' +
  'page[size]=10&' +
  'include=author,category&' +
  'fields[posts]=title,excerpt,publishedAt&' +
  'fields[users]=username,displayName&' +
  'fields[categories]=name'
);

const data = await response.json();
// Optimized: Only the fields you need
// Efficient: Author and category loaded in one request
```

### Use Case 2: Post Detail Page

**Goal:** Show full post with author, category, tags, and comments

```javascript
// 1. Load post with relationships
const postResponse = await fetch(
  '/api/posts/1?include=author,category,tags'
);
const postData = await postResponse.json();

// 2. Load top-level comments
const commentsResponse = await fetch(
  '/api/comments?' +
  'filter[postId]=1&' +
  'filter[parentCommentId]=null&' +
  'sort=-createdAt&' +
  'include=author&' +
  'page[size]=20'
);
const comments = await commentsResponse.json();

// 3. For each comment, you can lazily load replies on demand
async function loadReplies(commentId) {
  const response = await fetch(`/api/comments/${commentId}/replies?include=author`);
  return response.json();
}
```

### Use Case 3: User Profile Page

**Goal:** Show user info, their posts, followers, and following

```javascript
// 1. Load user
const userResponse = await fetch('/api/users/1');
const user = await userResponse.json();

// 2. Load user's posts
const postsResponse = await fetch(
  '/api/posts?filter[authorId]=1&sort=-publishedAt&page[size]=5'
);
const posts = await postsResponse.json();

// 3. Load followers count
const followersResponse = await fetch(
  '/api/users/1/followers?page[size]=1'
);
const followersData = await followersResponse.json();
const followerCount = followersData.meta.total;

// 4. Load following count
const followingResponse = await fetch(
  '/api/users/1/following?page[size]=1'
);
const followingData = await followingResponse.json();
const followingCount = followingData.meta.total;
```

### Use Case 4: Infinite Scroll

**Goal:** Load more posts as user scrolls

```javascript
let currentPage = 1;
const pageSize = 10;

async function loadMorePosts() {
  const response = await fetch(
    `/api/posts?` +
    `filter[status]=published&` +
    `sort=-publishedAt&` +
    `page[number]=${currentPage}&` +
    `page[size]=${pageSize}&` +
    `include=author`
  );
  
  const data = await response.json();
  
  // Append to existing list
  appendPostsToDOM(data.data, data.included);
  
  // Check if there are more pages
  if (currentPage < data.meta.page.totalPages) {
    currentPage++;
    return true; // Has more
  }
  
  return false; // No more
}
```

### Use Case 5: Like Button

**Goal:** Toggle like on a post or comment

```javascript
async function toggleLike(resourceType, resourceId, userId) {
  // Check if already liked
  const existingResponse = await fetch(
    `/api/likes?` +
    `filter[userId]=${userId}&` +
    `filter[likeableType]=${resourceType}&` +
    `filter[likeableId]=${resourceId}`
  );
  const existing = await existingResponse.json();
  
  if (existing.data.length > 0) {
    // Unlike
    await fetch(`/api/likes/${existing.data[0].id}`, {
      method: 'DELETE'
    });
    return false; // Now unliked
  } else {
    // Like
    await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          type: 'likes',
          attributes: {
            userId,
            likeableType: resourceType,
            likeableId: resourceId
          }
        }
      })
    });
    return true; // Now liked
  }
}

// Usage
const isLiked = await toggleLike('post', '1', currentUserId);
```

### Use Case 6: Search Posts

**Goal:** Filter posts by multiple criteria

```javascript
async function searchPosts({ query, category, tags, status }) {
  const params = new URLSearchParams({
    'sort': '-publishedAt',
    'page[size]': '20',
    'include': 'author,category'
  });
  
  if (category) params.append('filter[categoryId]', category);
  if (status) params.append('filter[status]', status);
  // Note: Full text search not supported, but you can filter by fields
  
  const response = await fetch(`/api/posts?${params}`);
  return response.json();
}
```

---

## WarpDrive Integration Tips

### Schema Definitions

When defining WarpDrive schemas, use these resource types:

```javascript
// Resource types match API types
'users'
'posts'
'categories'
'tags'
'comments'
'likes'
'follows'
```

### Relationship Configurations

```javascript
// Example schema for posts
{
  author: belongsTo('user'),
  category: belongsTo('category'),
  tags: hasMany('tag'),
  comments: hasMany('comment')
}

// Example schema for comments (self-referential!)
{
  author: belongsTo('user'),
  post: belongsTo('post'),
  parentComment: belongsTo('comment', { inverse: 'replies' }),
  replies: hasMany('comment', { inverse: 'parentComment' })
}

// Example schema for likes (polymorphic!)
{
  user: belongsTo('user'),
  likeable: belongsTo('likeable', { polymorphic: true })
}
```

### Cache Considerations

- Post/comment `likeCount` and `commentCount` are cached counts
- They update automatically when creating/deleting likes/comments
- Followers/following counts can be retrieved from meta

---

## Rate Limiting

**None.** This is a testing API with no rate limits.

---

## Versioning

**Version:** 1.0.0

This API follows semantic versioning. Breaking changes will increment major version.

---

## Support

This is a testing/learning API. For issues or questions:
- Check the documentation in the `/server` directory
- Review `ALL-PHASES-COMPLETE.md` for implementation details
- Run test suites for examples (`./test-api.sh`, `./test-phase2.sh`, `./test-phase3.sh`)

---

## Quick Reference

### Available Resources
- ✅ Users (with followers/following)
- ✅ Posts (with relationships)
- ✅ Categories
- ✅ Tags
- ✅ Comments (threaded)
- ✅ Likes (polymorphic)

### Query Features
- ✅ Pagination (`page[number]`, `page[size]`)
- ✅ Sorting (`sort`)
- ✅ Filtering (`filter[field]`)
- ✅ Includes (`include`)
- ✅ Sparse fields (`fields[type]`)

### Relationship Patterns
- ✅ Belongs-to
- ✅ Has-many
- ✅ Many-to-many
- ✅ Self-referential (comments)
- ✅ Polymorphic (likes)
- ✅ Self-join (follows)

---

**Happy developing with WarpDrive!** 🚀

