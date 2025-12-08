# WarpDrive Test Server

A JSON:API-compliant REST API server for testing and learning WarpDrive (ember-data next-gen).

## Quick Start

```bash
# Install dependencies
npm install

# Run the server
npm start

# Run with auto-reload (development)
npm run dev
```

The server will start on `http://localhost:3000`

## Endpoints

### Meta Endpoints
- `GET /` - Server info and available endpoints
- `GET /health` - Health check with timestamp
- `GET /stats` - Current data counts
- `POST /reset` - Reset data to seed state (idempotent testing)

### API Endpoints
All endpoints support full CRUD and advanced query features!

**Users** (`/api/users`)
- `GET /api/users` - List with pagination, sorting, sparse fields
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Posts** (`/api/posts`)
- `GET /api/posts` - List with pagination, sorting, filtering, includes, sparse fields
- `GET /api/posts/:id` - Get single post with optional includes
- `POST /api/posts` - Create post with relationships
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

**Categories** & **Tags** (`/api/categories`, `/api/tags`)
- Full CRUD with pagination, sorting, sparse fields

**See [API-QUICK-REFERENCE.md](./API-QUICK-REFERENCE.md) for copy-paste examples!**

### Example Request

```bash
curl http://localhost:3000/api/users
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
    "count": 5
  }
}
```

## Features

- ✅ JSON:API specification compliance
- ✅ CORS enabled for frontend integration
- ✅ In-memory data store (fast, idempotent)
- ✅ Seed data from JSON files
- ✅ Zero database dependencies
- 🚧 Pagination, filtering, sorting (planned)
- 🚧 Relationship sideloading (planned)
- 🚧 Full CRUD operations (planned)

## Data Management

This server uses **plain JavaScript objects with JSON seed files** for data storage.

**Why?**
- ✅ Simple: Zero dependencies
- ✅ Fast: In-memory operations
- ✅ Idempotent: Resets on restart
- ✅ Portable: No database setup required

**How it works:**
1. Seed data loads from `data/seed.json` on startup
2. All operations happen in-memory via `store.js`
3. Data resets when server restarts

See [DATA_MANAGEMENT.md](./DATA_MANAGEMENT.md) for detailed documentation.

## Current Seed Data

The server comes with realistic seed data:
- **5 users** - WarpDrive core team members + example user
- **6 posts** - Mix of published and draft blog posts
- **4 categories** - Getting Started, Advanced Topics, Tutorials, Case Studies
- **7 tags** - JavaScript, TypeScript, Ember.js, React, Performance, etc.

View counts at any time:
```bash
curl http://localhost:3000/stats
```

## Tech Stack

- **Node.js** - Runtime (v24+ recommended)
- **Express 5** - Web framework
- **CORS** - Cross-origin resource sharing
- **Plain JS** - In-memory data store (no database!)

## Project Structure

```
server/
├── index.js              # Main server & API routes
├── store.js              # In-memory data store class
├── data/
│   └── seed.json        # Initial seed data
├── api-plan.md          # API specification & roadmap
├── DATA_MANAGEMENT.md   # Data strategy documentation
├── package.json         # Dependencies & scripts
└── README.md            # This file
```

## Development

### Auto-reload During Development

```bash
npm run dev
```

Uses Node's built-in `--watch` flag. Any changes to `index.js` will automatically restart the server.

### Reset Data While Running

```bash
curl -X POST http://localhost:3000/reset
```

Reloads seed data without restarting the server.

### Modify Seed Data

Edit `data/seed.json` and restart:

```bash
# Edit the file
vim data/seed.json

# Restart server
npm start
```

## Testing the API

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Get Single User
```bash
curl http://localhost:3000/api/users/1
```

### Get Stats
```bash
curl http://localhost:3000/stats
```

### Test 404 Handling
```bash
curl http://localhost:3000/api/users/999
```

## Testing

### Phase 1: CRUD Operations
```bash
./test-api.sh
```
Tests all CRUD operations, filtering, relationships, and error handling.

### Phase 2: Advanced Query Features
```bash
./test-phase2.sh
```
Tests pagination, sorting, includes, sparse fieldsets, and combined queries.

## Next Steps

### Phase 1: Core CRUD ✅ (Complete!)
- [x] In-memory store with seed data
- [x] User endpoints (GET, POST, PATCH, DELETE)
- [x] Post endpoints with relationships
- [x] Category endpoints
- [x] Tag endpoints
- [x] Full CRUD (POST, PATCH, DELETE)
- [x] Basic filtering (by status, etc.)
- [x] JSON:API compliance
- [x] Error handling (404, 400, 422, 409)

### Phase 2: Advanced Query Features ✅ (Complete!)
- [x] Pagination (`?page[number]=1&page[size]=10`)
- [x] Filtering (`?filter[status]=published`) - from Phase 1
- [x] Sorting (`?sort=-publishedAt,title`)
- [x] Relationship sideloading (`?include=author,category,tags`)
- [x] Sparse fieldsets (`?fields[posts]=title,status`)
- [x] Combined queries (all features work together)

### Phase 3: Complex Relationships
- [ ] Comment threading (self-referential)
- [ ] Polymorphic likes
- [ ] Many-to-many tags
- [ ] User follows

See [api-plan.md](./api-plan.md) for the complete implementation roadmap.

## Documentation

- **[api-plan.md](./api-plan.md)** - Complete API specification, domain model, and testing scenarios
- **[DATA_MANAGEMENT.md](./DATA_MANAGEMENT.md)** - In-depth explanation of the data storage strategy

## Contributing

This is a learning/testing project for WarpDrive. Feel free to:
- Add more seed data
- Implement additional endpoints
- Add query features (pagination, filtering, etc.)
- Improve JSON:API compliance

---

**Happy WarpDrive Testing!** 🚀

