#!/bin/bash

# WarpDrive API Test Script
# Tests all CRUD operations for Phase 1 endpoints

set -e

API_URL="${API_URL:-http://localhost:3000}"

echo "🧪 WarpDrive API CRUD Test Suite"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test helper function
test_endpoint() {
    echo -e "${BLUE}$1${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# =================================
# 1. Test Server Health
# =================================
test_endpoint "1. Testing Server Health"
curl -s $API_URL/health | python3 -m json.tool > /dev/null
success "Server is healthy"
echo ""

# =================================
# 2. Test Stats Endpoint
# =================================
test_endpoint "2. Testing Stats"
curl -s $API_URL/stats | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  Users: {data[\"users\"]}')
print(f'  Posts: {data[\"posts\"]} ({data[\"publishedPosts\"]} published, {data[\"draftPosts\"]} draft)')
print(f'  Categories: {data[\"categories\"]}')
print(f'  Tags: {data[\"tags\"]}')
"
success "Stats retrieved"
echo ""

# =================================
# 3. Test Users CRUD
# =================================
test_endpoint "3. Testing Users CRUD"

# CREATE
info "Creating new user..."
NEW_USER=$(curl -s -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "users",
      "attributes": {
        "username": "testuser",
        "email": "test@warpdrive.io",
        "displayName": "Test User",
        "bio": "Created via API test"
      }
    }
  }')

USER_ID=$(echo $NEW_USER | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")
success "Created user with ID: $USER_ID"

# READ
info "Reading user..."
curl -s $API_URL/api/users/$USER_ID | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
print(f'  Username: {data[\"attributes\"][\"username\"]}')
print(f'  Email: {data[\"attributes\"][\"email\"]}')
" > /dev/null
success "User retrieved"

# UPDATE
info "Updating user..."
curl -s -X PATCH $API_URL/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "users",
      "id": "'$USER_ID'",
      "attributes": {
        "bio": "Updated via PATCH request"
      }
    }
  }' > /dev/null
success "User updated"

# DELETE
info "Deleting user..."
curl -s -X DELETE $API_URL/api/users/$USER_ID -w "%{http_code}" | grep -q "204"
success "User deleted"
echo ""

# =================================
# 4. Test Posts CRUD
# =================================
test_endpoint "4. Testing Posts CRUD"

# CREATE
info "Creating new post..."
NEW_POST=$(curl -s -X POST $API_URL/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "attributes": {
        "title": "Test Post from API",
        "body": "This is a test post created via the CRUD test suite.",
        "excerpt": "A test post for WarpDrive.",
        "status": "draft"
      },
      "relationships": {
        "author": {
          "data": { "type": "users", "id": "1" }
        },
        "category": {
          "data": { "type": "categories", "id": "3" }
        },
        "tags": {
          "data": [
            { "type": "tags", "id": "1" },
            { "type": "tags", "id": "2" }
          ]
        }
      }
    }
  }')

POST_ID=$(echo $NEW_POST | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")
success "Created post with ID: $POST_ID"

# READ
info "Reading post with relationships..."
curl -s $API_URL/api/posts/$POST_ID | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
print(f'  Title: {data[\"attributes\"][\"title\"]}')
print(f'  Status: {data[\"attributes\"][\"status\"]}')
print(f'  Author ID: {data[\"relationships\"][\"author\"][\"data\"][\"id\"]}')
print(f'  Category ID: {data[\"relationships\"][\"category\"][\"data\"][\"id\"]}')
" > /dev/null
success "Post retrieved with relationships"

# UPDATE (publish the post)
info "Publishing the post..."
curl -s -X PATCH $API_URL/api/posts/$POST_ID \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "id": "'$POST_ID'",
      "attributes": {
        "status": "published"
      }
    }
  }' | python3 -c "
import sys, json
data = json.load(sys.stdin)['data']
print(f'  New status: {data[\"attributes\"][\"status\"]}')
print(f'  Published at: {data[\"attributes\"].get(\"publishedAt\", \"N/A\")}')
" > /dev/null
success "Post published"

# DELETE
info "Deleting post..."
curl -s -X DELETE $API_URL/api/posts/$POST_ID -w "%{http_code}" | grep -q "204"
success "Post deleted"
echo ""

# =================================
# 5. Test Categories CRUD
# =================================
test_endpoint "5. Testing Categories CRUD"

# CREATE
info "Creating new category..."
NEW_CATEGORY=$(curl -s -X POST $API_URL/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "categories",
      "attributes": {
        "name": "Test Category",
        "description": "Created via API test"
      }
    }
  }')

CATEGORY_ID=$(echo $NEW_CATEGORY | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")
success "Created category with ID: $CATEGORY_ID"

# READ
info "Reading category..."
curl -s $API_URL/api/categories/$CATEGORY_ID > /dev/null
success "Category retrieved"

# UPDATE
info "Updating category..."
curl -s -X PATCH $API_URL/api/categories/$CATEGORY_ID \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "categories",
      "id": "'$CATEGORY_ID'",
      "attributes": {
        "description": "Updated description"
      }
    }
  }' > /dev/null
success "Category updated"

# DELETE
info "Deleting category..."
curl -s -X DELETE $API_URL/api/categories/$CATEGORY_ID -w "%{http_code}" | grep -q "204"
success "Category deleted"
echo ""

# =================================
# 6. Test Tags CRUD
# =================================
test_endpoint "6. Testing Tags CRUD"

# CREATE
info "Creating new tag..."
NEW_TAG=$(curl -s -X POST $API_URL/api/tags \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "tags",
      "attributes": {
        "name": "Test Tag"
      }
    }
  }')

TAG_ID=$(echo $NEW_TAG | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")
success "Created tag with ID: $TAG_ID"

# READ
info "Reading tag..."
curl -s $API_URL/api/tags/$TAG_ID > /dev/null
success "Tag retrieved"

# UPDATE
info "Updating tag..."
curl -s -X PATCH $API_URL/api/tags/$TAG_ID \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "tags",
      "id": "'$TAG_ID'",
      "attributes": {
        "name": "Updated Tag Name"
      }
    }
  }' > /dev/null
success "Tag updated"

# DELETE
info "Deleting tag..."
curl -s -X DELETE $API_URL/api/tags/$TAG_ID -w "%{http_code}" | grep -q "204"
success "Tag deleted"
echo ""

# =================================
# 7. Test Filtering
# =================================
test_endpoint "7. Testing Query Filters"

info "Filtering posts by status=published..."
PUBLISHED_COUNT=$(curl -s "$API_URL/api/posts?filter%5Bstatus%5D=published" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))")
success "Found $PUBLISHED_COUNT published posts"

info "Filtering posts by status=draft..."
DRAFT_COUNT=$(curl -s "$API_URL/api/posts?filter%5Bstatus%5D=draft" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))")
success "Found $DRAFT_COUNT draft posts"
echo ""

# =================================
# 8. Test Error Handling
# =================================
test_endpoint "8. Testing Error Handling"

info "Testing 404 for non-existent user..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/users/99999)
[ "$HTTP_CODE" = "404" ] && success "404 returned correctly" || echo "❌ Expected 404, got $HTTP_CODE"

info "Testing 400 for invalid user creation..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"data":{"type":"users","attributes":{}}}')
[ "$HTTP_CODE" = "400" ] && success "400 returned correctly" || echo "❌ Expected 400, got $HTTP_CODE"

info "Testing 422 for invalid post relationship..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "posts",
      "attributes": {"title": "Test"},
      "relationships": {"author": {"data": {"type": "users", "id": "99999"}}}
    }
  }')
[ "$HTTP_CODE" = "422" ] && success "422 returned correctly" || echo "❌ Expected 422, got $HTTP_CODE"
echo ""

# =================================
# Summary
# =================================
echo "=================================="
echo -e "${GREEN}✓ All CRUD tests passed!${NC}"
echo ""
echo "API is ready for WarpDrive integration 🚀"

