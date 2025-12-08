# API Plan for WarpDrive Stress Testing

## Overview

This API is designed to thoroughly exercise WarpDrive's capabilities including:
- **Relational data** (belongs-to, has-many, many-to-many)
- **CRUD operations** for all resource types
- **Pagination** and filtering
- **Nested relationships** and complex queries
- **Mutations** and optimistic updates
- **Caching strategies**
- **Real-time updates** (optional websocket extension)

---

## Domain Model: Blog Platform with Social Features

A semi-complex blog platform that models realistic scenarios while showcasing WarpDrive's strengths.

### Core Resources

#### 1. **User** (`/api/users`)
Represents authors, commenters, and followers.

**Attributes:**
- `id` (string): Unique identifier
- `username` (string): Unique username
- `email` (string): Email address
- `displayName` (string): Full/display name
- `bio` (string, optional): User biography
- `avatarUrl` (string, optional): Profile picture URL
- `createdAt` (datetime): Account creation timestamp
- `updatedAt` (datetime): Last update timestamp

**Relationships:**
- `posts` (has-many): Posts authored by this user
- `comments` (has-many): Comments made by this user
- `followers` (has-many): Users following this user
- `following` (has-many): Users this user follows
- `likes` (has-many): Likes given by this user

**Key Endpoints:**
- `GET /api/users` - List all users (paginated)
- `GET /api/users/:id` - Get single user with relationships
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/posts` - Get user's posts
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get users this user follows

---

#### 2. **Post** (`/api/posts`)
Blog posts with rich content and metadata.

**Attributes:**
- `id` (string): Unique identifier
- `title` (string): Post title
- `slug` (string): URL-friendly slug
- `body` (string): Post content (markdown)
- `excerpt` (string): Short summary
- `status` (enum): `draft`, `published`, `archived`
- `publishedAt` (datetime, optional): Publication timestamp
- `viewCount` (integer): Number of views
- `likeCount` (integer): Cached like count
- `commentCount` (integer): Cached comment count
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last update timestamp

**Relationships:**
- `author` (belongs-to): User who wrote the post
- `category` (belongs-to): Primary category
- `tags` (has-many): Associated tags
- `comments` (has-many): Comments on this post
- `likes` (has-many): Likes on this post

**Key Endpoints:**
- `GET /api/posts` - List posts (paginated, filterable by status, author, category, tag)
- `GET /api/posts/:id` - Get single post with relationships
- `POST /api/posts` - Create new post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/:id/comments` - Get post comments (paginated)
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post

---

#### 3. **Comment** (`/api/comments`)
Comments on posts with threading support.

**Attributes:**
- `id` (string): Unique identifier
- `body` (string): Comment content
- `likeCount` (integer): Cached like count
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last update timestamp

**Relationships:**
- `author` (belongs-to): User who wrote the comment
- `post` (belongs-to): Post being commented on
- `parentComment` (belongs-to, optional): Parent comment for threading
- `replies` (has-many): Nested replies to this comment
- `likes` (has-many): Likes on this comment

**Key Endpoints:**
- `GET /api/comments` - List comments (filterable by post, author)
- `GET /api/comments/:id` - Get single comment
- `POST /api/comments` - Create new comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like a comment

---

#### 4. **Category** (`/api/categories`)
Post categories for organization.

**Attributes:**
- `id` (string): Unique identifier
- `name` (string): Category name
- `slug` (string): URL-friendly slug
- `description` (string, optional): Category description
- `postCount` (integer): Cached count of posts

**Relationships:**
- `posts` (has-many): Posts in this category

**Key Endpoints:**
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/posts` - Get category posts

---

#### 5. **Tag** (`/api/tags`)
Flexible tagging system (many-to-many with posts).

**Attributes:**
- `id` (string): Unique identifier
- `name` (string): Tag name
- `slug` (string): URL-friendly slug
- `postCount` (integer): Cached count of posts

**Relationships:**
- `posts` (has-many): Posts with this tag

**Key Endpoints:**
- `GET /api/tags` - List all tags
- `GET /api/tags/:id` - Get single tag
- `POST /api/tags` - Create tag
- `PATCH /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag
- `GET /api/tags/:id/posts` - Get tagged posts

---

#### 6. **Like** (`/api/likes`)
Polymorphic likes (can like posts or comments).

**Attributes:**
- `id` (string): Unique identifier
- `likeableType` (string): Type of resource being liked (`post` or `comment`)
- `likeableId` (string): ID of the resource being liked
- `createdAt` (datetime): Like timestamp

**Relationships:**
- `user` (belongs-to): User who liked
- `likeable` (polymorphic): The post or comment being liked

**Key Endpoints:**
- `GET /api/likes` - List likes (filterable by user, type)
- `POST /api/likes` - Create a like
- `DELETE /api/likes/:id` - Remove a like

---

## Advanced Features to Test

### 1. **Pagination**
All collection endpoints support:
- `page[number]` - Page number (1-indexed)
- `page[size]` - Results per page (default: 20, max: 100)

Example: `GET /api/posts?page[number]=2&page[size]=10`

### 2. **Filtering**
Support for query parameters:
- By status: `GET /api/posts?filter[status]=published`
- By author: `GET /api/posts?filter[author]=user-123`
- By category: `GET /api/posts?filter[category]=tech`
- By tag: `GET /api/posts?filter[tag]=javascript`
- By date range: `GET /api/posts?filter[publishedAfter]=2024-01-01`

### 3. **Sorting**
- Single field: `GET /api/posts?sort=-publishedAt` (descending)
- Multiple fields: `GET /api/posts?sort=-publishedAt,title`

### 4. **Including Relationships (Sideloading)**
- `GET /api/posts?include=author,category,tags`
- `GET /api/posts/:id?include=author,comments.author,likes`

### 5. **Sparse Fieldsets**
- `GET /api/posts?fields[posts]=title,publishedAt&fields[users]=username,avatarUrl`

### 6. **Mutations to Test**
- Create post → Update cache, invalidate related queries
- Like post → Optimistic update, increment counter
- Delete comment → Update post comment count
- Follow user → Update follower/following relationships
- Publish draft → Change status, set publishedAt

### 7. **Complex Queries**
- Get trending posts (most likes in last 7 days)
- Get user's feed (posts from followed users)
- Get popular tags this month
- Get posts with most engagement (comments + likes)

---

## JSON:API Compatibility

We'll follow the JSON:API specification for consistency with WarpDrive's patterns:

### Example Response Format

```json
{
  "data": {
    "type": "posts",
    "id": "1",
    "attributes": {
      "title": "Getting Started with WarpDrive",
      "slug": "getting-started-with-warpdrive",
      "body": "WarpDrive is the next iteration...",
      "status": "published",
      "publishedAt": "2024-12-01T10:00:00Z",
      "viewCount": 142,
      "likeCount": 23,
      "commentCount": 8,
      "createdAt": "2024-12-01T09:00:00Z",
      "updatedAt": "2024-12-01T10:00:00Z"
    },
    "relationships": {
      "author": {
        "data": { "type": "users", "id": "42" }
      },
      "category": {
        "data": { "type": "categories", "id": "tech" }
      },
      "tags": {
        "data": [
          { "type": "tags", "id": "javascript" },
          { "type": "tags", "id": "emberjs" }
        ]
      }
    }
  },
  "included": [
    {
      "type": "users",
      "id": "42",
      "attributes": {
        "username": "chris",
        "displayName": "Chris Thoburn"
      }
    }
  ]
}
```

---

## Implementation Phases

### Phase 1: Core CRUD (Immediate)
- Set up in-memory data store
- Implement User, Post, Category resources
- Basic CRUD operations
- Simple relationships

### Phase 2: Advanced Relationships (Next)
- Add Comment with threading
- Add Tag with many-to-many
- Add Like with polymorphic relationships
- Implement follower/following

### Phase 3: Query Features
- Pagination
- Filtering
- Sorting
- Sideloading (include parameter)
- Sparse fieldsets

### Phase 4: Advanced Features
- Optimistic update scenarios
- Complex aggregations
- Rate limiting headers
- ETag/caching headers
- WebSocket updates (optional)

---

## Testing Scenarios for WarpDrive

This API will allow the team to test:

1. **Schema Definition**: Define schemas for all resource types
2. **Request Handling**: Custom handlers for authentication, error handling
3. **Relationship Loading**: Lazy loading, eager loading, nested includes
4. **Cache Management**: Cache invalidation, cache updates, optimistic UI
5. **Mutations**: Create, update, delete with proper cache updates
6. **TypeScript**: Full type safety across all operations
7. **Reactivity**: Fine-grained updates when data changes
8. **Performance**: Pagination, limiting fields, efficient queries
9. **Edge Cases**: Polymorphic relationships, self-referential relationships (comments)

---

## Mock Data Strategy

- **10-20 users** with realistic profiles
- **50-100 posts** across multiple categories
- **20-30 categories and tags**
- **100-200 comments** with threading
- **Relationships**: Realistic follower networks, post likes, comment threads

We'll generate this data programmatically to ensure consistency and allow easy reset.

---

## Next Steps

1. Implement Phase 1 endpoints with in-memory store
2. Add JSON:API serialization helpers
3. Create seed data generator
4. Document each endpoint with example requests/responses
5. Add README for running the server
