# API Quick Reference

Quick copy-paste examples for testing the WarpDrive API.

## Server Info

```bash
# Check if server is running
curl http://localhost:3000/

# Health check
curl http://localhost:3000/health

# View data statistics
curl http://localhost:3000/stats

# Reset data to seed state
curl -X POST http://localhost:3000/reset
```

---

## Users

### List All Users
```bash
curl http://localhost:3000/api/users
```

### Get Single User
```bash
curl http://localhost:3000/api/users/1
```

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "users",
      "attributes": {
        "username": "johndoe",
        "email": "john@example.com",
        "displayName": "John Doe",
        "bio": "Software developer"
      }
    }
  }'
```

### Update User
```bash
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "users",
      "id": "1",
      "attributes": {
        "bio": "Updated bio text"
      }
    }
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

---

## Posts

### List All Posts
```bash
curl http://localhost:3000/api/posts
```

### Filter Posts by Status
```bash
# Published posts
curl "http://localhost:3000/api/posts?filter[status]=published"

# Draft posts
curl "http://localhost:3000/api/posts?filter[status]=draft"
```

### Get Single Post
```bash
curl http://localhost:3000/api/posts/1
```

### Create Post (with relationships)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "attributes": {
        "title": "Getting Started with WarpDrive",
        "body": "WarpDrive is an amazing data management library...",
        "excerpt": "Learn the basics of WarpDrive",
        "status": "draft"
      },
      "relationships": {
        "author": {
          "data": { "type": "users", "id": "1" }
        },
        "category": {
          "data": { "type": "categories", "id": "1" }
        },
        "tags": {
          "data": [
            { "type": "tags", "id": "1" },
            { "type": "tags", "id": "3" }
          ]
        }
      }
    }
  }'
```

### Update Post
```bash
curl -X PATCH http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "id": "1",
      "attributes": {
        "title": "Updated Title",
        "status": "published"
      }
    }
  }'
```

### Publish Draft Post
```bash
# Automatically sets publishedAt timestamp
curl -X PATCH http://localhost:3000/api/posts/6 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "id": "6",
      "attributes": {
        "status": "published"
      }
    }
  }'
```

### Delete Post
```bash
curl -X DELETE http://localhost:3000/api/posts/1
```

---

## Categories

### List All Categories
```bash
curl http://localhost:3000/api/categories
```

### Get Single Category
```bash
curl http://localhost:3000/api/categories/1
```

### Create Category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "categories",
      "attributes": {
        "name": "Web Development",
        "description": "Articles about web development"
      }
    }
  }'
```

### Update Category
```bash
curl -X PATCH http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "categories",
      "id": "1",
      "attributes": {
        "description": "Updated description"
      }
    }
  }'
```

### Delete Category
```bash
curl -X DELETE http://localhost:3000/api/categories/1
```

---

## Tags

### List All Tags
```bash
curl http://localhost:3000/api/tags
```

### Get Single Tag
```bash
curl http://localhost:3000/api/tags/1
```

### Create Tag
```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "tags",
      "attributes": {
        "name": "Vue.js"
      }
    }
  }'
```

### Update Tag
```bash
curl -X PATCH http://localhost:3000/api/tags/1 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "tags",
      "id": "1",
      "attributes": {
        "name": "JavaScript ES2024"
      }
    }
  }'
```

### Delete Tag
```bash
curl -X DELETE http://localhost:3000/api/tags/1
```

---

## Testing Error Responses

### 404 - Not Found
```bash
curl http://localhost:3000/api/users/99999
```

### 400 - Bad Request (Missing Required Field)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"data":{"type":"users","attributes":{}}}'
```

### 409 - Conflict (Duplicate Username)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "users",
      "attributes": {
        "username": "chris",
        "email": "duplicate@example.com"
      }
    }
  }'
```

### 422 - Unprocessable Entity (Invalid Relationship)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "attributes": {
        "title": "Test Post"
      },
      "relationships": {
        "author": {
          "data": { "type": "users", "id": "99999" }
        }
      }
    }
  }'
```

---

## Useful One-Liners

### Pretty Print JSON Responses
```bash
curl -s http://localhost:3000/api/posts | python3 -m json.tool
# or with jq
curl -s http://localhost:3000/api/posts | jq
```

### Count Results
```bash
curl -s http://localhost:3000/api/posts | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))"
```

### Extract Specific Fields
```bash
curl -s http://localhost:3000/api/users | python3 -c "
import sys, json
data = json.load(sys.stdin)
for user in data['data']:
    print(f\"{user['id']}: {user['attributes']['username']} - {user['attributes']['email']}\")
"
```

### Test Full CRUD Cycle
```bash
# Create
ID=$(curl -s -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -d '{"data":{"type":"tags","attributes":{"name":"Test"}}}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

echo "Created tag with ID: $ID"

# Read
curl -s http://localhost:3000/api/tags/$ID | python3 -m json.tool

# Update
curl -s -X PATCH http://localhost:3000/api/tags/$ID \
  -H "Content-Type: application/json" \
  -d '{"data":{"type":"tags","id":"'$ID'","attributes":{"name":"Updated"}}}' \
  | python3 -m json.tool

# Delete
curl -X DELETE http://localhost:3000/api/tags/$ID -w "Status: %{http_code}\n"
```

---

## Run Full Test Suite

```bash
./test-api.sh
```

This runs comprehensive tests for all endpoints, CRUD operations, filtering, and error handling.

---

## Common Workflows

### Create a Complete Blog Post

```bash
# 1. Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "users",
      "attributes": {
        "username": "blogger",
        "email": "blogger@example.com",
        "displayName": "Blog Writer"
      }
    }
  }'

# 2. Create a post as that user
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "attributes": {
        "title": "My First Post",
        "body": "Content here...",
        "status": "draft"
      },
      "relationships": {
        "author": { "data": { "type": "users", "id": "6" } },
        "category": { "data": { "type": "categories", "id": "1" } }
      }
    }
  }'

# 3. Publish the post
curl -X PATCH http://localhost:3000/api/posts/7 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "id": "7",
      "attributes": { "status": "published" }
    }
  }'
```

### Reset and Start Fresh

```bash
# Reset all data to seed state
curl -X POST http://localhost:3000/reset

# Verify reset
curl http://localhost:3000/stats
```

---

## Tips

1. **URL Encoding**: Square brackets in query params need encoding:
   - `filter[status]` → `filter%5Bstatus%5D`
   - Or use quotes: `"http://...?filter[status]=published"`

2. **JSON Formatting**: Always include `-H "Content-Type: application/json"` for POST/PATCH

3. **Status Codes**:
   - `200` = Success (GET, PATCH)
   - `201` = Created (POST)
   - `204` = No Content (DELETE)
   - `4xx` = Client error
   - `5xx` = Server error

4. **Relationships**: Always include type and id in relationship data

5. **Timestamps**: Automatically set by the server (createdAt, updatedAt)

6. **Slugs**: Auto-generated from name/title if not provided

---

Happy testing! 🚀

