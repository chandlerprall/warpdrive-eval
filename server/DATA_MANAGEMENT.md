# Data Management Strategy

## Overview

This server uses **plain JavaScript objects with JSON seed files** for data storage. This approach is ideal for learning and testing WarpDrive because it's:

- ✅ **Simple**: Zero dependencies, easy to understand
- ✅ **Fast**: In-memory operations
- ✅ **Idempotent**: Resets on every server restart
- ✅ **Transparent**: Easy to inspect and modify seed data
- ✅ **Portable**: No database installation required

## Architecture

```
┌─────────────────┐
│   seed.json     │  ← Initial data (on disk)
└────────┬────────┘
         │ Load on startup
         ▼
┌─────────────────┐
│   Store Class   │  ← In-memory data (RAM)
│  (store.js)     │
└────────┬────────┘
         │ CRUD operations
         ▼
┌─────────────────┐
│  Express API    │  ← HTTP endpoints
│  (index.js)     │
└─────────────────┘
```

## How It Works

### 1. **Seed Data** (`data/seed.json`)
- JSON file containing initial data
- Never modified by the application
- Easy to reset by restarting server
- Can be edited manually for different test scenarios

### 2. **Store Class** (`store.js`)
- Loads seed data on initialization
- Deep clones to avoid mutations
- Provides CRUD operations
- All operations happen in-memory
- Data is lost on server restart (intentional!)

### 3. **API Layer** (`index.js`)
- Express routes use the Store
- Transforms data to JSON:API format
- Handles request/response lifecycle

## Why Not a Real Database?

For this learning/testing project:

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **PostgreSQL** | Production-ready, SQL queries | Setup required, overkill | ❌ Too heavy |
| **SQLite** | Lightweight, SQL | Need migrations, file management | ❌ Unnecessary |
| **IndexedDB** | Browser standard | Node.js only (wrong environment) | ❌ Wrong tool |
| **lowdb** | Simple JSON DB | Persists changes (not idempotent) | ⚠️ Almost |
| **nedb** | MongoDB-like | Extra dependency, older | ⚠️ Almost |
| **Plain JS + JSON** | Simple, fast, idempotent | Manual query logic | ✅ Perfect fit |

## Store API

### Reading Data

```javascript
const store = require('./store');

// Get all records
const users = store.findAll('users');

// Find by ID
const user = store.findById('users', '1');

// Find with filter
const publishedPosts = store.findBy('posts', 
  post => post.status === 'published'
);

// Count records
const userCount = store.count('users');
const draftCount = store.count('posts', 
  post => post.status === 'draft'
);
```

### Writing Data

```javascript
// Create
const newUser = store.create('users', {
  username: 'john',
  email: 'john@example.com',
  displayName: 'John Doe'
});

// Update
const updated = store.update('users', '1', {
  bio: 'Updated bio'
});

// Delete
const deleted = store.delete('users', '1');
```

### Query Helpers

```javascript
// Pagination
const result = store.paginate(posts, { 
  page: 2, 
  size: 10 
});
// Returns: { data: [...], meta: { page, size, total, totalPages } }

// Sorting
const sorted = store.sort(posts, '-publishedAt,title');
// Prefix with '-' for descending

// Filtering
const filtered = store.filter(posts, {
  status: 'published',
  authorId: '1'
});
```

## Resetting Data

### Automatic Reset
Data automatically resets when you restart the server:

```bash
# Stop server (Ctrl+C)
# Start again
npm start
# All data is fresh from seed.json
```

### Manual Reset
Without restarting:

```bash
curl -X POST http://localhost:3000/reset
```

This reloads `seed.json` into memory.

## Adding More Seed Data

Edit `data/seed.json` directly:

```json
{
  "users": [
    {
      "id": "6",
      "username": "newuser",
      "email": "new@example.com",
      "displayName": "New User",
      "createdAt": "2024-12-05T10:00:00Z",
      "updatedAt": "2024-12-05T10:00:00Z"
    }
  ]
}
```

Restart the server to load the changes.

## Testing Scenarios

### Scenario 1: Test Create/Update
1. Start server (fresh data)
2. Create new posts via API
3. Update existing posts
4. Restart server
5. All changes are gone (idempotent ✓)

### Scenario 2: Test Relationships
1. Load posts with `include=author,category`
2. Modify relationships
3. Verify cache updates in WarpDrive
4. Reset to test again

### Scenario 3: Test Pagination
1. Add 100 posts to seed data
2. Test different page sizes
3. Test sorting combinations
4. Verify WarpDrive handles pagination

## Performance Considerations

### Why This Works Well

- **Small Dataset**: 5-100 records per type is plenty for learning
- **In-Memory**: Microsecond access times
- **No I/O**: No disk reads/writes after initial load
- **Simple Queries**: O(n) filtering is fine for small n

### If You Need More

For production or larger datasets, consider:
- **SQLite** with `better-sqlite3` (in-memory mode)
- **PostgreSQL** with Docker
- **MongoDB** with mongoose

But for WarpDrive learning/testing, this approach is ideal! 🚀

## Example: Full Request Flow

```
1. Client: GET /api/users?page[size]=2&sort=-createdAt

2. Express Handler:
   - Parse query params
   - Call store.findAll('users')
   - Call store.sort(users, '-createdAt')
   - Call store.paginate(users, { size: 2 })

3. Store (in-memory):
   - Access this.data.users array
   - Sort array by createdAt descending  
   - Slice array for page
   - Return { data, meta }

4. Express Response:
   - Transform to JSON:API format
   - Return JSON response

Total time: <1ms ⚡
```

## Maintenance

### Backup Seed Data
```bash
cp data/seed.json data/seed.backup.json
```

### Validate JSON
```bash
cat data/seed.json | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')))"
```

### View Current Store State
```bash
curl http://localhost:3000/stats
```

---

**TL;DR**: Plain JS + JSON seeds = Simple, fast, idempotent data layer perfect for learning WarpDrive! 🎉

