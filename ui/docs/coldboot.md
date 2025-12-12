# WarpDrive Evaluation - UI Cold Boot Guide

**Last Updated:** December 11, 2024  
**Current Status:** ✅ Iteration 1 Complete - Read-Only Lists (Posts, Users, Categories, Tags)

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
  - Iteration 1: ✅ Read-only lists (Posts, Users, Categories, Tags) (COMPLETE)
  - Iteration 2: Detail views & relationships
  - Iteration 3-8: Mutations, social features, caching, TypeScript, polish

---

## ✅ Current State (Iteration 1 Complete)

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
- **Core WarpDrive**: `@warp-drive/core@~5.8.0`, `@warp-drive/json-api@~5.8.0`, `@warp-drive/legacy@~5.8.0`
- **No `@ember-data/` imports**: All refactored to use `@warp-drive/*` packages directly
- Ember 6.8.x with Embroider/Vite build pipeline
- Note: Using `@warp-drive/legacy` for `useLegacyStore` factory (modern patterns only)

#### 6. **Resource Schemas** ✅
- **Post** (`app/models/post.js`) - title, slug, body, excerpt, status, timestamps, counts
- **User** (`app/models/user.js`) - username, email, displayName, bio, avatarUrl, timestamps
- **Category** (`app/models/category.js`) - name, slug, description, postCount
- **Tag** (`app/models/tag.js`) - name, slug, postCount
- All registered with store during initialization
- All use legacy mode for Ember compatibility
- **Key Learning**: Schema `type` must match API response exactly (`posts` not `post`)

#### 7. **Full Store Configuration** (`app/services/store.js`) ✅
- Uses `useLegacyStore` factory from `@warp-drive/legacy` (v5.8.0)
- All legacy features disabled (`linksMode: false`, etc.) for pure modern patterns
- Automatically provides: SchemaService, JSONAPICache, RequestManager, cache policy
- Custom handlers injected via `handlers` option
- All 4 schemas registered on construction
- 60% less code than manual implementation (~30 lines vs ~75 lines)

#### 8. **Request Builders** ✅
- **Posts** (`app/builders/posts.js`) - `queryPublishedPosts()` with filtering
- **Users** (`app/builders/users.js`) - `queryUsers()` with pagination/sorting
- **Categories** (`app/builders/categories.js`) - `queryCategories()` with sorting
- **Tags** (`app/builders/tags.js`) - `queryTags()` with sorting
- All follow WarpDrive builder pattern (return plain objects)
- **Key Learning**: `headers` must be `new Headers({...})` not plain objects

#### 9. **List Routes** ✅
- **Posts** (`app/routes/posts.js`) - Fetches published posts with filtering
- **Users** (`app/routes/users.js`) - Fetches all users with sorting
- **Categories** (`app/routes/categories.js`) - Fetches all categories
- **Tags** (`app/routes/tags.js`) - Fetches all tags
- All use builder pattern and handle errors gracefully
- All return data + meta + rawResponse for debugging

#### 10. **List Templates** ✅
- **Posts** (`app/templates/posts.gjs`) - Card layout with metadata and counts
- **Users** (`app/templates/users.gjs`) - Card layout with avatars and bios
- **Categories** (`app/templates/categories.gjs`) - Grid layout with descriptions
- **Tags** (`app/templates/tags.gjs`) - Tag cloud with post counts
- All include collapsible debug panels with raw JSON:API responses
- All have error and empty states

#### 11. **Navigation & Routing** ✅
- Navigation with Home, Posts, Users, Categories, Tags links
- All routes registered in router
- Active state styling
- Responsive design

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
│   ├── builders/
│   │   └── posts.js              # Request builders for post queries
│   ├── models/
│   │   └── post.js               # Post ResourceSchema
│   ├── services/
│   │   └── store.js              # WarpDrive Store with schema/cache
│   ├── routes/
│   │   ├── application.js        # Health check logic
│   │   └── posts.js              # Posts list route
│   ├── templates/
│   │   ├── application.gjs       # Shell with status card & nav
│   │   └── posts.gjs             # Posts list with debug panel
│   └── styles/
│       └── app.css               # Styling for all pages
```

---

## 🧭 Next Steps (Iteration 2)

See `plan.md` for full details. Summary:

1. **Add Relationships to Schemas**
   - Update Post schema: author (belongs-to user), category (belongs-to), tags (has-many)
   - Update User schema: posts (has-many)
   - Update Category schema: posts (has-many)
   - Update Tag schema: posts (has-many)

2. **Build Detail Routes**
   - Post detail: `/posts/:id` with `include=author,category,tags`
   - User detail: `/users/:id` with their posts
   - Show related data in templates

3. **Learn & Document**
   - How relationships work in schemas (`kind: 'resource'`, `kind: 'collection'`)
   - How `include` parameter loads related data
   - How to access included resources in templates
   - How the cache handles relationships

### Optional: Tests
- Route rendering smoke tests
- Contract tests for list fetch shapes
- (Can be deferred to Iteration 8 if needed)

---

## 🔑 Important Decisions & Patterns

### 1. Pure WarpDrive (No Legacy)
- ✅ Use `@warp-drive/core`, `@warp-drive/ember`
- ❌ Avoid `@ember-data/store`, `@ember-data/request`, etc.
- We're learning modern patterns, not bridging legacy code

### 2. Request Manager Architecture
- All HTTP goes through `store.requestManager`
- Middleware chain: BaseURL → Logging → Fetch → CacheHandler
- Absolute URLs bypass the BaseURLHandler (e.g., health check)

### 3. Builder Pattern for Requests
- All requests use plain builder functions (not wrapper functions)
- Builders return plain objects: `{ url, method, headers }`
- Pass builder result directly to `store.request()`
- Headers must be `new Headers({...})` instances

### 4. Schema Registration
- Schemas define resource types and their fields
- Schema `type` must match API response `type` exactly (e.g., `posts` not `post`)
- Register schemas via `store.schema.registerResource()`
- Use `legacy: true` mode for Ember apps

### 5. Configuration Strategy
- API connection configured via environment variables
- `API_HOST` and `API_NAMESPACE` can be overridden
- Helpers in `app/config/api.js` provide single source of truth

### 6. Learning-First Development
- Console logging intentionally verbose for learning
- Each iteration builds on previous (no rewrites)
- Document surprises and "aha!" moments as we go
- Explore multiple valid paths when unclear; not always one "correct" answer
- Document alternative approaches even when both work
- Sometimes the best understanding comes from exploring multiple paths and synthesizing insights
- Iteration over perfection: try, learn from errors/docs, adapt

---

## 🐛 Known Issues & Quirks

### Request Manager Handler Format
- Handlers must be objects with `async request(context, next)` method
- Plain functions don't work (even arrow functions in handler chain)
- Pattern: `{ async request(context, next) { ... } }`

### Store Configuration Requirements
- Must implement `createSchemaService()` - returns SchemaService instance
- Must implement `createCache()` - returns Cache instance (e.g., JSONAPICache)
- Must implement `instantiateRecord()` - creates reactive records from cache
- Must implement `teardownRecord()` - cleans up records
- Call `super(...args)` before accessing `this` in constructor

### Schema Type Matching
- Schema `type` field MUST match API response `type` exactly
- Case-sensitive and character-for-character match required
- Common mistake: `type: 'post'` when API returns `"type": "posts"`

### Builder Pattern Requirements
- Builders return plain objects: `{ url, method, headers, body }`
- Headers must be `new Headers({...})` instances, not plain objects
- Pass builder result directly to `store.request()`: `store.request(myBuilder())`
- Don't wrap builders in other function calls before passing to store

### Import Paths
- Use full module specifiers: `ui/utils/request-manager` not `../utils/...`
- Ember resolver handles these via `exports` in `package.json`

### JSON.stringify and Response Objects
- Don't stringify the entire response object (has circular references)
- Use `response.content` instead of `response` for JSON display
- The full response contains store references which create circular structures
- Safe to stringify: `response.content`, `response.content.data`, `response.content.meta`

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

## 🤔 Questions Answered (Iteration 1)

- ✅ **How does schema registration work?** Call `store.schema.registerResource()` with schema definition
- ✅ **When do we need `@warp-drive/json-api`?** For `JSONAPICache` to handle JSON:API formatted responses
- ✅ **What's the difference between `store.request()` and `store.requestManager.request()`?** 
  - `store.request()` goes through cache and creates reactive records
  - `requestManager.request()` is lower-level, just executes HTTP
- ✅ **How do builders work?** Return plain objects with `{ url, method, headers }`, pass directly to `store.request()`

## 🤔 Questions for Future Exploration

- How do we handle relationships in schemas?
- When should we use `store.peekRecord()` vs `store.findRecord()`?
- How does the cache invalidation strategy work?
- How do included resources work with relationships?
- What happens when we fetch the same resource multiple times?

---

## 📖 Documentation Guide

### Docs in This Folder

- **coldboot.md** (this file) - Main guide, current status, setup, architecture
- **plan.md** - 8-iteration roadmap with goals and success criteria
- **ITERATION-1-SUMMARY.md** - Technical summary of what we built (posts)
- **STORE-CONFIGURATION.md** - Deep dive: Store setup exploration + comparison

### Navigation by Use Case

**"I'm new here"**
1. Read this file (coldboot.md) - overview and current status
2. Read `plan.md` - understand the roadmap
3. Review `ITERATION-1-SUMMARY.md` - see what's working

**"I want to understand Store configuration"**
1. Read `STORE-CONFIGURATION.md` - exploration journey + technical comparison
2. Look at `app/services/store.js` - current implementation
3. Compare with `app/services/store-manual.js.bak` - manual reference

**"I'm continuing development"**
1. Check this file → "Next Steps" section above
2. Review `plan.md` for current iteration details
3. Read previous iteration summary for context

**"I hit an issue"**
1. Check this file → "Known Issues & Quirks" section
2. Review `STORE-CONFIGURATION.md` for Store-related issues
3. Look at iteration summaries for similar problems solved

### External Documentation

- **Local KB**: `/kb/README.md` (WarpDrive documentation from official site)
- **API Docs**: `/server/API-DOCUMENTATION.md` (endpoint reference)
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

And be able to synthesize the knowledge into a concise report that a team of human frontend developers can understand and use to build a modern Ember app using WarpDrive.

## 🤖 LLM / Agent rules

- After each iteration you should update this file to reflect the current state of the project.
- Remember to document findings, "aha!" moments, etc.
- Also record any questions that arise during the iteration.

---

**Ready to continue?** 
- Complete Iteration 1: Add schemas/routes for users, categories, and tags
- Or skip to Iteration 2: Detail views & relationships (we can add users/categories/tags as needed)
- Review what we learned so far in ITERATION-1-SUMMARY.md

**Having issues?** Check console logs (RequestManager logs everything), verify the API server is running, and review this file's "Known Issues" section.

## 💡 Key Learnings from Iteration 1

1. **Store requires 4 methods**: `createSchemaService()`, `createCache()`, `instantiateRecord()`, `teardownRecord()`
2. **Schema type matching is critical**: Must match API response exactly (e.g., `posts` not `post`)
3. **Builder pattern is clean**: Return plain objects, not wrapped function calls
4. **Headers must be Headers instances**: Use `new Headers({...})` not plain objects
5. **Data flows smoothly**: Request → RequestManager → Cache → Reactive Records → Template

## 🔀 Alternative Approaches Explored

### Store Configuration (see `STORE-APPROACHES.md`)
We explored **three approaches** for configuring the Store:

1. **Manual Implementation** (Approach 1)
   - Extend `Store` and implement 4 methods manually
   - Full control, explicit, educational
   - More boilerplate (~75 lines)
   - Saved in `store-manual.js.bak` for reference

2. **useRecommendedStore** (Approach 2)
   - Found in WarpDrive source code
   - **Discovery**: Not yet exported in v5.6.0!
   - Coming in v6+ as the recommended approach
   - Attempted but couldn't use yet

3. **useLegacyStore** (Approach 3) ✅ **Current Choice**
   - Available now from `@warp-drive/legacy`
   - Factory function with configuration object
   - Less boilerplate (~30 lines)
   - Disable legacy flags for pure modern patterns
   - Current implementation in `store.js`

**Why we chose useLegacyStore:** After learning the manual approach, we discovered `useRecommendedStore` isn't exported yet. `useLegacyStore` provides the same factory benefits while we wait for v6. By disabling all legacy features, we get pure modern WarpDrive patterns with less boilerplate. Perfect example of exploring multiple paths and finding the practical solution!

