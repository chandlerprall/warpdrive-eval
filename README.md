# WarpDrive Evaluation Project

> **A hands-on exploration of WarpDrive**, the next-generation data management layer for Ember.js

This project is a comprehensive learning journey and evaluation of [WarpDrive](https://canary.warp-drive.io/) through building a realistic blog platform with social features. It consists of a custom JSON:API-compliant REST API and a modern Ember UI that exercises WarpDrive's capabilities across a wide range of real-world scenarios.

---

## 🎯 What is This?

WarpDrive is the modern successor to `ember-data`, offering improved performance, better TypeScript support, and a more flexible architecture. This project exists to:

- **Learn by building**: Understand WarpDrive through hands-on implementation
- **Document patterns**: Discover and share best practices for modern Ember + WarpDrive apps
- **Stress-test features**: Exercise relationships, caching, mutations, and advanced queries
- **Create a reference**: Build a working example others can learn from

### What's Built

**Test API Server** (`/server/`) - A production-quality JSON:API backend with:
- 8 resource types with full CRUD operations
- Complex relationships: belongs-to, has-many, many-to-many, self-referential, polymorphic
- Advanced features: pagination, sorting, filtering, includes, sparse fieldsets
- 30+ endpoints with 50+ passing tests
- Zero database dependencies (in-memory with seed data)

**Modern Ember UI** (`/ui/`) - A WarpDrive-powered frontend featuring:
- Pure WarpDrive implementation (no legacy `ember-data`)
- Resource schemas, request builders, and reactive relationships
- List and detail views with on-demand relationship loading
- Custom request handlers and caching strategies
- Debug panels and comprehensive logging for learning

### Current Status

✅ **Iteration 2 Complete** - Detail Views & Relationships
- Posts, users, categories, and tags with full schemas
- Detail views with belongs-to relationships
- On-demand relationship loading via reusable component
- Health check and API integration

🔜 **Next Up**: Iteration 3 - Threaded comments, mutations, social features

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- A terminal and your favorite code editor

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd warpdrive-eval

# Install server dependencies
cd server
npm install

# Install UI dependencies
cd ../ui
npm install
```

### 2. Start the API Server

```bash
cd server
npm start
```

Server runs on `http://localhost:3000`

**Verify it's working:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Start the UI

In a new terminal:

```bash
cd ui
npm start
```

UI runs on `http://localhost:4200`

**Verify it's working:**
- Visit `http://localhost:4200`
- You should see a green "API Connection: Healthy ✓" status card
- Click through Posts, Users, Categories, Tags to explore
- Open browser console to see request/response debug logs

---

## 📁 Project Structure

```
warpdrive-eval/
├── server/              # JSON:API test server
│   ├── index.js         # Main server entry
│   ├── routes/          # API endpoints (users, posts, comments, etc.)
│   ├── data/seed.json   # Realistic seed data
│   ├── README.md        # Server documentation
│   └── API-DOCUMENTATION.md  # Complete API reference
│
├── ui/                  # Ember + WarpDrive frontend
│   ├── app/
│   │   ├── models/      # WarpDrive resource schemas
│   │   ├── routes/      # Route handlers with data fetching
│   │   ├── templates/   # Glimmer templates (.gjs files)
│   │   ├── builders/    # Request builders (queries)
│   │   ├── handlers/    # Custom request handlers
│   │   └── services/    # Store and services
│   ├── docs/
│   │   ├── coldboot.md  # Detailed technical guide (for LLMs)
│   │   └── plan.md      # 8-iteration roadmap
│   └── README.md        # UI documentation
│
├── kb/                  # WarpDrive documentation (scraped from official site)
└── README.md           # This file
```

---

## 📚 Documentation

### Getting Started (Human-Friendly)

- **[This README]** - Project overview and quick start
- **[server/README.md](./server/README.md)** - API server guide
- **[server/API-QUICK-REFERENCE.md](./server/API-QUICK-REFERENCE.md)** - Copy-paste API examples
- **[ui/docs/plan.md](./ui/docs/plan.md)** - UI iteration roadmap

### Deep Dive (Technical Details)

- **[ui/docs/coldboot.md](./ui/docs/coldboot.md)** - Complete technical guide (architecture, patterns, learnings)
- **[server/API-DOCUMENTATION.md](./server/API-DOCUMENTATION.md)** - Full API reference (1200+ lines)
- **[server/ALL-PHASES-COMPLETE.md](./server/ALL-PHASES-COMPLETE.md)** - Implementation overview
- **[kb/README.md](./kb/README.md)** - Local copy of WarpDrive docs

### External Resources

- **Official WarpDrive Docs**: https://canary.warp-drive.io/
- **WarpDrive GitHub**: https://github.com/warp-drive-data/warp-drive
- **WarpDrive Discord**: https://discord.gg/PHBbnWJx5S

---

## 🎓 What You'll Learn

By exploring this project, you'll understand:

1. ✅ **Setting up WarpDrive** in a modern Ember app
2. ✅ **Resource Schemas** - Defining types, fields, and relationships
3. ✅ **Request Patterns** - Builders, handlers, and the RequestManager
4. ✅ **Relationships** - Belongs-to, has-many, includes, and on-demand loading
5. ✅ **Store Configuration** - Cache, schema service, and reactive records
6. 🔄 **Mutations** - Creating, updating, and deleting resources (Iteration 4)
7. 🔜 **Advanced Patterns** - Polymorphic relationships, self-referential data, caching strategies
8. 🔜 **TypeScript Integration** - Typing requests, responses, and records

### Key Learnings Documented

- How relationships work in WarpDrive vs legacy ember-data
- Request handler architecture and custom handlers
- On-demand vs eager loading patterns
- Cache behavior and deduplication
- Common gotchas and their solutions

See **[ui/docs/coldboot.md § Key Learnings](./ui/docs/coldboot.md#-key-learnings-from-iteration-1--2)** for detailed insights.

---

## 🧪 Testing the API

The server includes comprehensive test scripts:

```bash
cd server

# Test core CRUD operations
./test-api.sh

# Test advanced queries (pagination, sorting, includes)
./test-phase2.sh

# Test complex relationships (comments, likes, follows)
./test-phase3.sh
```

All tests should pass ✅

### Manual Testing Examples

```bash
# Get all posts with author and category
curl "http://localhost:3000/api/posts?include=author,category"

# Get a single user with their posts
curl "http://localhost:3000/api/users/1?include=posts"

# Filter published posts
curl "http://localhost:3000/api/posts?filter[status]=published"

# Paginate results
curl "http://localhost:3000/api/posts?page[size]=5&page[number]=2"

# View data statistics
curl http://localhost:3000/stats

# Reset to seed data
curl -X POST http://localhost:3000/reset
```

See **[server/API-QUICK-REFERENCE.md](./server/API-QUICK-REFERENCE.md)** for more examples.

---

## 🛠️ Development

### Server Commands

```bash
cd server
npm start          # Start server
npm run dev        # Start with auto-reload on file changes
npm test           # Run test suite (via test scripts)
```

### UI Commands

```bash
cd ui
npm start          # Start dev server (http://localhost:4200)
npm test           # Run test suite
npm run lint       # Run linters
npm run lint:fix   # Auto-fix linting issues
```

### Environment Configuration

**Server** - Edit `server/index.js` or set environment variables:
- `PORT` - Server port (default: 3000)

**UI** - Set environment variables before starting:
```bash
export API_HOST=http://localhost:3000
export API_NAMESPACE=api
npm start
```

Or create `ui/.env`:
```
API_HOST=http://localhost:3000
API_NAMESPACE=api
```

---

## 🌟 Features Implemented

### Server (API)

✅ **8 Resource Types**
- Users, Posts, Categories, Tags, Comments, Likes, Follows

✅ **Full CRUD**
- Create, Read, Update, Delete for all resources

✅ **Advanced Queries**
- Pagination: `?page[number]=1&page[size]=10`
- Sorting: `?sort=-publishedAt,title`
- Filtering: `?filter[status]=published`
- Includes: `?include=author,category,tags`
- Sparse fieldsets: `?fields[posts]=title,status`

✅ **Complex Relationships**
- Belongs-to, has-many, many-to-many
- Self-referential (comment threads)
- Polymorphic (likes on posts OR comments)
- Self-join (user follows)

✅ **Production-Quality**
- Comprehensive error handling (400, 404, 409, 422, 500)
- JSON:API v1.0 compliant
- Relationship validation
- Cascade deletes

### UI (WarpDrive Frontend)

✅ **Pure WarpDrive**
- No legacy `@ember-data/` imports
- Modern `@warp-drive/core` and `@warp-drive/ember` packages

✅ **Resource Management**
- 4 resource schemas (Post, User, Category, Tag)
- Request builders for queries
- Custom relationship link handler

✅ **Views**
- List pages: Posts, Users, Categories, Tags
- Detail pages: Post and User with relationships
- Debug panels showing raw JSON:API responses

✅ **Relationships**
- Schema definitions for belongs-to and has-many
- On-demand loading via `ResolveRelationship` component
- Automatic caching and deduplication

✅ **Developer Experience**
- Comprehensive request/response logging
- Collapsible debug panels in UI
- Detailed inline documentation

---

## 🚦 Project Status

### Completed Iterations

- ✅ **Iteration 0**: Scaffold, environment, health check
- ✅ **Iteration 1**: List views for all resource types
- ✅ **Iteration 2**: Detail views with relationship loading

### Next Steps (Iteration 3)

- [ ] Comment threading (self-referential relationships)
- [ ] Nested comment display with lazy-loading
- [ ] Comment author relationships

See **[ui/docs/plan.md](./ui/docs/plan.md)** for the full roadmap.

---

## 🤝 Contributing

This is primarily a learning project, but contributions, feedback, and questions are welcome!

- **Found an issue?** Open a GitHub issue
- **Have a question about WarpDrive?** Check [coldboot.md](./ui/docs/coldboot.md) or the [official docs](https://canary.warp-drive.io/)
- **Want to suggest an improvement?** Pull requests welcome

---

## 📝 License

MIT License - Feel free to use this project as a reference or starting point for your own WarpDrive exploration.

---

## 🙏 Acknowledgments

- **WarpDrive Team** - For building the next generation of Ember data management
- **Ember Community** - For ongoing support and feedback
- **JSON:API Spec** - For providing a solid foundation for API design

---

**Happy exploring!** 🚀🌌

Questions? Check the docs in `/server/` and `/ui/docs/`, or dive into the code to see WarpDrive in action.

