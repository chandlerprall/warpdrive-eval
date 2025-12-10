# WarpDrive Evaluation - UI Cold Boot Guide

**Last Updated:** December 10, 2024  
**Current Status:** ✅ Iteration 0 Complete - Scaffold & Plumbing

---

## 🎯 Project Goal

This project is an **exploratory learning journey** to understand and evaluate **WarpDrive** (the next iteration of ember-data) through hands-on implementation. We're building a modern Ember UI backed by a custom JSON:API test server to stress-test WarpDrive's capabilities, discover patterns, and document best practices.

### Key Principles
- **Iterative & Incremental**: Build vertically through features, one slice at a time
- **Learning-Focused**: Challenges and discoveries are valuable; document them
- **Real-World Patterns**: Use actual data relationships (posts, users, comments, likes)
- **Modern Stack**: No legacy ember-data; pure WarpDrive from `@warp-drive/core` and `@warp-drive/ember`

---

## 📚 Context & Resources

### Knowledge Base
- **`/kb/`**: Complete WarpDrive documentation scraped from [canary.warp-drive.io](https://canary.warp-drive.io/)
  - Installation, configuration, schemas, requests, caching, TypeScript
  - Start with `kb/README.md` for navigation

### Test API Server
- **`/server/`**: Custom JSON:API v1.0 server with rich relational data
  - Resources: users, posts, categories, tags, comments, likes
  - Features: pagination, sorting, filtering, includes, sparse fieldsets
  - Relationships: belongs-to, has-many, many-to-many, self-referential, polymorphic
  - See `server/API-DOCUMENTATION.md` for full reference
  - Default: `http://localhost:3000/api`

### Iteration Plan
- **`ui/plan.md`**: Detailed roadmap with 8 iterations
  - Iteration 0: ✅ Scaffold & plumbing (COMPLETE)
  - Iteration 1: Read-only list (posts index)
  - Iteration 2: Detail views & relationships
  - Iteration 3-8: Mutations, social features, caching, TypeScript, polish

---

## ✅ Current State (Iteration 0 Complete)

### What's Been Built

#### 1. **Configuration & Environment**
- `config/environment.js`: API host/namespace configuration
  - Default: `API_HOST=http://localhost:3000`, `API_NAMESPACE=api`
  - Exposed as `config.apiBaseURL` and `config.APP.api.*`
  
- `app/config/api.js`: Centralized API URL helpers
  - `apiHost`, `apiNamespace`, `apiBaseURL` exports
  - `apiURL(path, options)` helper for building URLs

#### 2. **WarpDrive Request Manager**
- `app/utils/request-manager.js`: Custom request manager factory
  - **BaseURLHandler**: Prefixes relative URLs with `apiBaseURL`
  - **LoggingHandler**: Console debug logs for all requests/responses with timing
  - **Fetch**: WarpDrive's built-in fetch handler
  - Uses `@warp-drive/core` (RequestManager, Fetch)

#### 3. **Store Service**
- `app/services/store.js`: Ember service extending WarpDrive's Store
  - Instantiates custom RequestManager in constructor
  - Ready for schema registration in future iterations
  - Uses `@warp-drive/core` (Store)

#### 4. **Health Check Route**
- `app/routes/application.js`: Application route with health check
  - Injects store service
  - Uses `store.requestManager.request()` for health check to `/health`
  - Exposes API connection state to template

- `app/templates/application.gjs`: Shell template
  - Status card showing API connection state (green = healthy)
  - Displays host, namespace, and health check result
  - Basic styling in `app/styles/app.css`

#### 5. **Dependencies**
- **Core WarpDrive**: `@warp-drive/core@~5.6.0`, `@warp-drive/json-api@~5.6.0`
- **No `@ember-data/` imports**: All refactored to use `@warp-drive/*` packages directly
- Ember 6.8.x with Embroider/Vite build pipeline

---

## 🚀 How to Run

### Prerequisites
```bash
# Ensure Node.js >= 20
node --version
```

### Start the API Server
```bash
cd /Users/cprall/projects/warpdrive-eval/server
npm install  # if first time
npm start    # Runs on http://localhost:3000
```

### Start the UI
```bash
cd /Users/cprall/projects/warpdrive-eval/ui
npm install  # if first time
npm start    # Runs on http://localhost:4200
```

### Verify Setup
1. Visit `http://localhost:4200`
2. Should see green status card: "API Connection: Healthy ✓"
3. Open browser console to see request/response debug logs
4. Try `http://localhost:3000` to see API root response

---

## 📁 Key Files & Structure

```
ui/
├── plan.md                       # Iteration roadmap (read this!)
├── coldboot.md                   # This file
├── package.json                  # WarpDrive deps: @warp-drive/core, @warp-drive/json-api
├── config/
│   └── environment.js            # API host/namespace config
├── app/
│   ├── config/
│   │   └── api.js                # API URL helpers
│   ├── utils/
│   │   └── request-manager.js    # Custom RequestManager with logging
│   ├── services/
│   │   └── store.js              # WarpDrive Store service
│   ├── routes/
│   │   └── application.js        # Health check logic
│   ├── templates/
│   │   └── application.gjs       # Shell with status card
│   └── styles/
│       └── app.css               # Basic styling
```

---

## 🧭 Next Steps (Iteration 1)

See `plan.md` for full details. Summary:

1. **Define Post Schema** (schema-record)
   - Create `app/models/post.js` with ResourceSchema
   - Fields: title, slug, body, excerpt, status, publishedAt, counts
   - No relationships yet (iteration 2)

2. **Build Posts Index Route**
   - Route: `/posts` → fetch published posts
   - Use `store.request()` with query builder from `@warp-drive/json-api`
   - Template: Simple list of post titles (no styling needed yet)

3. **Learn & Document**
   - How schema registration works
   - How to use query builders
   - How data flows from request → cache → component

### Success Criteria for Iteration 1
- Schema defined and registered
- `/posts` route renders a list of post titles from API
- No errors in console
- Request/response logs visible in console

---

## 🔑 Important Decisions & Patterns

### 1. Pure WarpDrive (No Legacy)
- ✅ Use `@warp-drive/core`, `@warp-drive/ember`
- ❌ Avoid `@ember-data/store`, `@ember-data/request`, etc.
- We're learning modern patterns, not bridging legacy code

### 2. Request Manager Architecture
- All HTTP goes through `store.requestManager`
- Middleware chain: BaseURL → Logging → Fetch
- Absolute URLs bypass the BaseURLHandler (e.g., health check)

### 3. Configuration Strategy
- API connection configured via environment variables
- `API_HOST` and `API_NAMESPACE` can be overridden
- Helpers in `app/config/api.js` provide single source of truth

### 4. Learning-First Development
- Console logging intentionally verbose for learning
- Each iteration builds on previous (no rewrites)
- Document surprises and "aha!" moments as we go

---

## 🐛 Known Issues & Quirks

### Request Manager Handler Format
- Handlers must be objects with `async request(context, next)` method
- Plain functions don't work (even arrow functions in handler chain)
- Pattern: `{ async request(context, next) { ... } }`

### Store Instantiation
- Must call `super(...args)` before accessing `this` in constructor
- RequestManager should be assigned in constructor, not class field

### Import Paths
- Use full module specifiers: `ui/utils/request-manager` not `../utils/...`
- Ember resolver handles these via `exports` in `package.json`

---

## 📝 Useful Commands

```bash
# Development
npm start                 # Start dev server (http://localhost:4200)
npm test                  # Run test suite
npm run lint              # Run linters (JS, CSS, HBS)
npm run lint:fix          # Auto-fix linting issues

# Server interaction
curl http://localhost:3000/health          # Health check
curl http://localhost:3000/api/posts       # Get posts
curl http://localhost:3000/stats           # Data counts
curl -X POST http://localhost:3000/reset   # Reset to seed data
```

---

## 🤔 Questions for Future Exploration

- How does schema registration work with `store.registerSchema()`?
- When do we need `@warp-drive/json-api` vs `@warp-drive/core`?
- What's the difference between `store.request()` and `store.requestManager.request()`?
- How do we handle relationships in schemas?
- When should we use `store.peekRecord()` vs `store.findRecord()`?
- How does the cache invalidation strategy work?

---

## 📖 Related Documentation

- **Local Docs**: `/kb/README.md` (navigation guide)
- **API Docs**: `/server/API-DOCUMENTATION.md` (endpoint reference)
- **Plan**: `ui/plan.md` (iteration roadmap)
- **Official Site**: https://canary.warp-drive.io/
- **GitHub**: https://github.com/warp-drive-data/warp-drive
- **Discord**: https://discord.gg/PHBbnWJx5S

---

## 🎓 Learning Goals

By the end of this project, we should understand:
1. ✅ How to set up WarpDrive in a modern Ember app
2. ✅ How to configure a custom RequestManager
3. 🔜 How to define schemas (ResourceSchema)
4. 🔜 How to make requests and handle responses
5. 🔜 How relationships work in WarpDrive
6. 🔜 How the cache works and when it updates
7. 🔜 How to handle mutations (create/update/delete)
8. 🔜 TypeScript integration patterns

---

**Ready to continue?** Start with `plan.md` Iteration 1, or jump into `kb/README.md` to learn more about WarpDrive concepts before building.

**Having issues?** Check console logs (RequestManager logs everything), verify the API server is running, and review this file's "Known Issues" section.

