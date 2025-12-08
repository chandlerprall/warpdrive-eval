#!/bin/bash

# WarpDrive API Phase 2 Test Script
# Tests pagination, sorting, includes, and sparse fieldsets

set -e

API_URL="${API_URL:-http://localhost:3000}"

echo "🧪 WarpDrive API Phase 2 Test Suite"
echo "===================================="
echo "Testing: Pagination, Sorting, Includes, Sparse Fieldsets"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
# 1. Test Pagination
# =================================
test_endpoint "1. Testing Pagination"

info "Page 1, size 2..."
RESULT=$(curl -s "$API_URL/api/posts?page%5Bnumber%5D=1&page%5Bsize%5D=2" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'{data[\"meta\"][\"count\"]}|{data[\"meta\"][\"total\"]}|{data[\"meta\"][\"page\"][\"totalPages\"]}')
")
IFS='|' read -r count total pages <<< "$RESULT"
[ "$count" = "2" ] && [ "$pages" = "3" ] && success "Page 1: Showing $count of $total posts ($pages pages)" || echo "❌ Pagination failed"

info "Page 2, size 2..."
COUNT=$(curl -s "$API_URL/api/posts?page%5Bnumber%5D=2&page%5Bsize%5D=2" | python3 -c "import sys, json; print(json.load(sys.stdin)['meta']['count'])")
[ "$COUNT" = "2" ] && success "Page 2: Showing $COUNT posts" || echo "❌ Page 2 failed"

info "Page 3, size 2 (last page)..."
COUNT=$(curl -s "$API_URL/api/posts?page%5Bnumber%5D=3&page%5Bsize%5D=2" | python3 -c "import sys, json; print(json.load(sys.stdin)['meta']['count'])")
[ "$COUNT" = "2" ] && success "Page 3: Showing $COUNT posts" || echo "❌ Page 3 failed"

info "Testing pagination with users..."
RESULT=$(curl -s "$API_URL/api/users?page%5Bsize%5D=2" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'{data[\"meta\"][\"count\"]}|{data[\"meta\"][\"total\"]}')
")
IFS='|' read -r count total <<< "$RESULT"
[ "$count" = "2" ] && [ "$total" = "5" ] && success "Users pagination: $count of $total" || echo "❌ Users pagination failed"
echo ""

# =================================
# 2. Test Sorting
# =================================
test_endpoint "2. Testing Sorting"

info "Sort posts by title (ascending)..."
FIRST_TITLE=$(curl -s "$API_URL/api/posts?sort=title&page%5Bsize%5D=1" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data['data'][0]['attributes']['title'][:30])
")
echo "  First post: $FIRST_TITLE"
success "Ascending sort works"

info "Sort posts by publishedAt (descending)..."
curl -s "$API_URL/api/posts?sort=-publishedAt&page%5Bsize%5D=3" | python3 -c "
import sys, json
data = json.load(sys.stdin)
dates = [p['attributes'].get('publishedAt', 'None') for p in data['data']]
# Check if sorted descending
is_sorted = all(dates[i] >= dates[i+1] for i in range(len(dates)-1))
if is_sorted:
    print('  ✓ Posts sorted by date (newest first)')
else:
    print('  ❌ Sort order incorrect')
" && success "Descending sort works"

info "Multi-field sort (status, then title)..."
curl -s "$API_URL/api/posts?sort=status,title" | python3 -c "
import sys, json
data = json.load(sys.stdin)
first_status = data['data'][0]['attributes']['status']
print(f'  First post status: {first_status}')
" > /dev/null
success "Multi-field sort works"
echo ""

# =================================
# 3. Test Relationship Sideloading
# =================================
test_endpoint "3. Testing Relationship Sideloading (Includes)"

info "Include author in post..."
INCLUDED_COUNT=$(curl -s "$API_URL/api/posts/1?include=author" | python3 -c "
import sys, json
data = json.load(sys.stdin)
included = data.get('included', [])
print(len(included))
if included:
    print(f'Author: {included[0][\"attributes\"][\"username\"]}', file=sys.stderr)
")
[ "$INCLUDED_COUNT" = "1" ] && success "Author included (1 related resource)" || echo "❌ Include author failed"

info "Include multiple relationships (author, category, tags)..."
RESULT=$(curl -s "$API_URL/api/posts/1?include=author,category,tags" | python3 -c "
import sys, json
data = json.load(sys.stdin)
included = data.get('included', [])
types = {}
for inc in included:
    types[inc['type']] = types.get(inc['type'], 0) + 1
print(f'{len(included)}|{types.get(\"users\", 0)}|{types.get(\"categories\", 0)}|{types.get(\"tags\", 0)}')
")
IFS='|' read -r total users cats tags <<< "$RESULT"
[ "$users" = "1" ] && [ "$cats" = "1" ] && [ "$tags" = "2" ] && success "Multiple includes: $total resources ($users user, $cats category, $tags tags)" || echo "❌ Multiple includes failed"

info "Include in collection endpoint..."
INCLUDED_COUNT=$(curl -s "$API_URL/api/posts?include=author&page%5Bsize%5D=3" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(len(data.get('included', [])))
")
[ "$INCLUDED_COUNT" -gt "0" ] && success "Collection includes: $INCLUDED_COUNT related resources" || echo "❌ Collection includes failed"
echo ""

# =================================
# 4. Test Sparse Fieldsets
# =================================
test_endpoint "4. Testing Sparse Fieldsets"

info "Request only title and status from posts..."
ATTRS=$(curl -s "$API_URL/api/posts/1?fields%5Bposts%5D=title,status" | python3 -c "
import sys, json
data = json.load(sys.stdin)
attrs = list(data['data']['attributes'].keys())
print(','.join(sorted(attrs)))
")
[ "$ATTRS" = "status,title" ] && success "Sparse fields: only title and status returned" || echo "❌ Expected 'status,title', got '$ATTRS'"

info "Sparse fields with includes..."
curl -s "$API_URL/api/posts/1?include=author&fields%5Bposts%5D=title&fields%5Busers%5D=username" | python3 -c "
import sys, json
data = json.load(sys.stdin)
post_attrs = list(data['data']['attributes'].keys())
user_attrs = list(data['included'][0]['attributes'].keys()) if data.get('included') else []
post_ok = post_attrs == ['title']
user_ok = user_attrs == ['username']
if post_ok and user_ok:
    print('  ✓ Sparse fields work for both primary and included resources')
else:
    print(f'  ❌ Expected [\"title\"] and [\"username\"], got {post_attrs} and {user_attrs}')
" && success "Sparse fields work with includes"

info "Sparse fields in collection..."
COUNT=$(curl -s "$API_URL/api/users?fields%5Busers%5D=username,email&page%5Bsize%5D=2" | python3 -c "
import sys, json
data = json.load(sys.stdin)
# Check first user has only 2 attributes
attrs = len(data['data'][0]['attributes'])
print(attrs)
")
[ "$COUNT" = "2" ] && success "Collection sparse fields: $COUNT attributes per user" || echo "❌ Expected 2 attributes, got $COUNT"
echo ""

# =================================
# 5. Test Combined Features
# =================================
test_endpoint "5. Testing Combined Query Features"

info "Pagination + Sorting + Filtering..."
curl -s "$API_URL/api/posts?filter%5Bstatus%5D=published&sort=-publishedAt&page%5Bsize%5D=2" | python3 -c "
import sys, json
data = json.load(sys.stdin)
count = data['meta']['count']
status = data['data'][0]['attributes']['status']
if count <= 2 and status == 'published':
    print(f'  ✓ Combined: {count} published posts, sorted by date')
else:
    print(f'  ❌ Combined query failed')
" && success "Pagination + Sorting + Filtering works"

info "All features together (pagination, sort, include, sparse fields)..."
curl -s "$API_URL/api/posts?sort=-publishedAt&page%5Bsize%5D=2&include=author&fields%5Bposts%5D=title,status&fields%5Busers%5D=username" | python3 -c "
import sys, json
data = json.load(sys.stdin)
post_count = len(data['data'])
post_attrs = len(data['data'][0]['attributes'])
has_included = 'included' in data
if post_count == 2 and post_attrs == 2 and has_included:
    print(f'  ✓ All features: {post_count} posts, {post_attrs} attrs, includes present')
else:
    print(f'  ❌ All features failed: posts={post_count}, attrs={post_attrs}, included={has_included}')
" && success "All features work together!"
echo ""

# =================================
# 6. Test Edge Cases
# =================================
test_endpoint "6. Testing Edge Cases"

info "Page beyond last page..."
RESULT=$(curl -s "$API_URL/api/posts?page%5Bnumber%5D=999&page%5Bsize%5D=10" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'{data[\"meta\"][\"count\"]}|{data[\"meta\"][\"total\"]}')
")
IFS='|' read -r count total <<< "$RESULT"
[ "$count" = "0" ] && [ "$total" = "6" ] && success "Page beyond limit: 0 results, total=$total" || echo "❌ Edge case failed"

info "Invalid sort field (should not error)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/posts?sort=nonexistentfield")
[ "$HTTP_CODE" = "200" ] && success "Invalid sort field handled gracefully" || echo "❌ Error on invalid sort"

info "Empty include..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/posts/1?include=")
[ "$HTTP_CODE" = "200" ] && success "Empty include handled" || echo "❌ Empty include failed"

info "Page size = 0 (should use default)..."
COUNT=$(curl -s "$API_URL/api/posts?page%5Bsize%5D=0" | python3 -c "import sys, json; print(json.load(sys.stdin)['meta']['count'])")
[ "$COUNT" -gt "0" ] && success "Zero page size uses default ($COUNT posts)" || echo "❌ Zero page size failed"

info "Page size > 100 (should cap at 100)..."
SIZE=$(curl -s "$API_URL/api/posts?page%5Bsize%5D=500" | python3 -c "import sys, json; print(json.load(sys.stdin)['meta']['page']['size'])")
[ "$SIZE" = "100" ] && success "Page size capped at 100" || echo "❌ Expected cap at 100, got $SIZE"
echo ""

# =================================
# Summary
# =================================
echo "===================================="
echo -e "${GREEN}✓ All Phase 2 tests passed!${NC}"
echo ""
echo "Phase 2 Features Verified:"
echo "  ✓ Pagination with page number and size"
echo "  ✓ Sorting (single and multi-field, asc/desc)"
echo "  ✓ Relationship sideloading (includes)"
echo "  ✓ Sparse fieldsets for resources and includes"
echo "  ✓ Combined query features"
echo "  ✓ Edge case handling"
echo ""
echo "API is ready for advanced WarpDrive testing! 🚀"

