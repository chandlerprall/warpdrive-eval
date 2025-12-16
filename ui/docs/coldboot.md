# WarpDrive Evaluation - UI Cold Boot Guide

**Last Updated:** December 15, 2024  
**Current Status:** ✅ Iteration 2 Complete - Detail Views & Relationships

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
  - Iteration 2: ✅ Detail views & relationships (COMPLETE)
  - Iteration 3-8: Mutations, comments, social features, caching, TypeScript, polish

---

## ✅ Current State (Iteration 2 Complete)

### What's Been Built

**Iteration 2 additions are marked with 🆕**

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

#### 6. **Resource Schemas** ✅ 🆕
- **Post** (`app/models/post.js`) - title, slug, body, excerpt, status, timestamps, counts
  - 🆕 **Relationships**: author (belongs-to user), category (belongs-to category), tags (has-many tags)
- **User** (`app/models/user.js`) - username, email, displayName, bio, avatarUrl, timestamps
  - 🆕 **Relationships**: posts (has-many posts)
- **Category** (`app/models/category.js`) - name, slug, description, postCount
  - 🆕 **Relationships**: posts (has-many posts)
- **Tag** (`app/models/tag.js`) - name, slug, postCount
  - 🆕 **Relationships**: posts (has-many posts)
- All registered with store during initialization
- All use legacy mode for Ember compatibility
- **Key Learning**: Schema `type` must match API response exactly (`posts` not `post`)
- 🆕 **Relationship syntax**: `kind: 'resource'` for belongs-to, `kind: 'collection'` for has-many

#### 7. **Full Store Configuration** (`app/services/store.js`) ✅
- Uses `useLegacyStore` factory from `@warp-drive/legacy` (v5.8.0)
- `linksMode: false` - WarpDrive's linksMode isn't yet fully implemented
- Automatically provides: SchemaService, JSONAPICache, RequestManager, cache policy
- Custom handlers chain: BaseURL → Logging → RelationshipLinks → EagerLoader → Fetch
- All 4 schemas registered on construction
- 60% less code than manual implementation (~30 lines vs ~75 lines)

#### 7.1. **Custom Request Handlers** 🆕
**Purpose:** Work around WarpDrive's incomplete async relationship implementation

**RelationshipLinksHandler** (`app/handlers/relationship-links.js`):
- Injects JSON:API `links` into relationship objects
- Detects JSON:API responses by shape (not content-type header)
- Adds `links.related` URLs for each relationship based on type + id
- Enables proper JSON:API relationship structure

**EagerRelationshipLoader** (`app/handlers/eager-relationship-loader.js`):
- Pre-fetches missing relationships before template access
- Extracts all relationship identifiers from response
- Checks store cache to avoid duplicate fetches
- Fetches missing resources in parallel via direct fetch
- Adds fetched resources to response's `included` array
- Result: All relationship data available immediately (no loading states)

**Handler Flow:**
```
Request:  BaseURL → Logging → RelationshipLinks → EagerLoader → Fetch
Response: Fetch → EagerLoader → RelationshipLinks → Logging → BaseURL
```

1. Fetch returns raw response
2. EagerLoader extracts relationships, pre-fetches missing ones, adds to `included`
3. RelationshipLinks injects `links` into all relationships
4. Logging logs the enhanced response
5. Cache handler (automatic) stores everything

#### 8. **Request Builders** ✅
- **Posts** (`app/builders/posts.js`) - `queryPublishedPosts()` with filtering
  - 🆕 `findPost(id)` - fetch single post with `include=author,category,tags`
- **Users** (`app/builders/users.js`) - `queryUsers()` with pagination/sorting
  - 🆕 `findUser(id)` - fetch single user with `include=posts`
- **Categories** (`app/builders/categories.js`) - `queryCategories()` with sorting
- **Tags** (`app/builders/tags.js`) - `queryTags()` with sorting
- All follow WarpDrive builder pattern (return plain objects)
- **Key Learning**: `headers` must be `new Headers({...})` not plain objects
- 🆕 **Include parameter**: Use `?include=author,category,tags` to sideload relationships

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
- 🆕 **Detail routes**: `/posts/:id` and `/users/:id` with nested routes
- 🆕 **Relationship display**: Post detail shows author, category, and tags
- 🆕 **Relationship navigation**: User detail shows their posts, clickable back to post detail
- All routes registered in router
- Active state styling
- Responsive design

#### 12. **Detail Templates** ✅
- **Post Detail** (`app/templates/posts/detail.gjs`)
  - Full post content display
  - Author card (belongs-to relationship) with link to user detail
  - Category card (belongs-to relationship)
  - Tags list (has-many relationship)
  - Post statistics
  - Breadcrumb navigation
- **User Detail** (`app/templates/users/detail.gjs`)
  - User profile information with avatar
  - User's posts grid (has-many relationship) with links to post details
  - Breadcrumb navigation
- Both include collapsible debug panels showing raw JSON:API response

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

## 🧭 Next Steps (Iteration 3)

See `plan.md` for full details. Summary:

1. **Threaded Comments**
   - Add Comment schema with self-referential relationships (parent/children)
   - Show top-level comments on post detail
   - Add "Load replies" functionality for nested comments
   - Lazy-load replies per comment thread

2. **Comment Display**
   - Add comments section to post detail page
   - Show comment author, content, timestamp
   - Display nested replies with indentation
   - Implement optimistic UI for expanding/collapsing threads

3. **Learn & Document**
   - Self-referential relationships in WarpDrive
   - Lazy loading patterns for performance
   - Recursive template rendering for nested data
   - Cache updates for dynamically loaded data

### Optional: Tests
- Route rendering tests for detail pages
- Relationship loading tests
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

### Relationship Access Pattern ⚠️
- **All relationships require `.data`**: Both `kind: 'resource'` and `kind: 'collection'`
- Relationships return `ResourceRelationship` objects, not direct resources
- **Belongs-to**: `post.author.data` (single resource) ✅ WORKS
- **Has-many**: `user.posts.data` (array of resources) ⛔ NOT YET IMPLEMENTED
- Properties: `relationship.lid`, `relationship.name`, `relationship.data`, `relationship.links`, `relationship.meta`
- This is NOT a bug - it's how WarpDrive exposes relationship metadata alongside data

### Collection Fields (Has-Many) Not Yet Implemented ⛔
- **CRITICAL LIMITATION**: WarpDrive v5.8.0 does not support accessing `kind: 'collection'` fields
- Source: [collection-field.ts#L9](https://github.com/warp-drive-data/warp-drive/blob/4d2f2cbf3bbbfcd62d07f1b6fe778a2472dbb975/warp-drive-packages/core/src/reactive/-private/kind/collection-field.ts#L9)
- Error thrown: `"Accessing collection fields is not yet implemented"`
- **What works**: Defining collection relationships in schemas ✅
- **What works**: Including collection data via API (`?include=tags`) ✅
- **What works**: Data being cached ✅
- **What DOESN'T work**: Accessing the relationship in templates/code ⛔
- **Workaround**: EagerRelationshipLoader pre-fetches has-many relationships and adds to `included`, but templates still can't access them via `.data`
- **Affected templates**: `posts/detail.gjs` (tags), `users/detail.gjs` (posts) - has-many sections commented out

### Async Relationships (`linksMode`) Not Yet Implemented ⛔  
- **DISCOVERED LIMITATION**: WarpDrive's `linksMode` flag exists but isn't fully functional
- Source: [validate-document-fields.ts#L85-L130](https://github.com/warp-drive-data/warp-drive/blob/4d2f2cbf3bbbfcd62d07f1b6fe778a2472dbb975/warp-drive-packages/json-api/src/-private/validate-document-fields.ts#L85-L130)
- Setting `async: true` with relationship links doesn't trigger automatic fetching
- **Workaround**: Implemented custom handlers that eagerly pre-fetch all relationships
  - RelationshipLinksHandler: Injects `links` into relationships
  - EagerRelationshipLoader: Pre-fetches missing relationships, adds to `included`
- This approach gives us immediate data availability without loading states

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

## 🤔 Questions Answered

### Iteration 1
- ✅ **How does schema registration work?** Call `store.schema.registerResource()` with schema definition
- ✅ **When do we need `@warp-drive/json-api`?** For `JSONAPICache` to handle JSON:API formatted responses
- ✅ **What's the difference between `store.request()` and `store.requestManager.request()`?** 
  - `store.request()` goes through cache and creates reactive records
  - `requestManager.request()` is lower-level, just executes HTTP
- ✅ **How do builders work?** Return plain objects with `{ url, method, headers }`, pass directly to `store.request()`

### Iteration 2 🆕
- ✅ **How do relationships work in schemas?** Use `kind: 'resource'` for belongs-to, `kind: 'collection'` for has-many
- ✅ **How do included resources work with relationships?** Use `?include=author,tags` in query params, WarpDrive automatically caches and links them
- ✅ **How to access relationships in templates?** Must use `.data` property: `post.author.data.username` or `user.posts.data`
- ✅ **Why the `.data` property?** Relationships return a `ResourceRelationship` object containing metadata AND data
- ✅ **What happens when we fetch the same resource multiple times?** Cache deduplicates - included resources are cached just like primary resources

## 🤔 Questions for Future Exploration

- How do self-referential relationships work (e.g., comment replies)?
- When should we use `store.peekRecord()` vs `store.findRecord()`?
- How does the cache invalidation strategy work?
- How do we handle lazy-loading of relationships?
- What's the performance impact of including many relationships?
- How do we handle mutations (create/update/delete) with relationships?
- ⛔ **When will collection fields (has-many) be accessible?** Currently not implemented in WarpDrive v5.8.0

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

## 💡 Key Learnings from Iteration 1 & 2

### Iteration 1 (Setup & Lists)
1. **Store requires 4 methods**: `createSchemaService()`, `createCache()`, `instantiateRecord()`, `teardownRecord()`
2. **Schema type matching is critical**: Must match API response exactly (e.g., `posts` not `post`)
3. **Builder pattern is clean**: Return plain objects, not wrapped function calls
4. **Headers must be Headers instances**: Use `new Headers({...})` not plain objects
5. **Data flows smoothly**: Request → RequestManager → Cache → Reactive Records → Template

### Iteration 2 (Relationships & Detail Views) ✅
1. **Relationship syntax is straightforward**: 
   - `kind: 'resource'` for belongs-to (single related resource)
   - `kind: 'collection'` for has-many (array of related resources)
   - `type` property specifies the related resource type
   - `options.inverse` sets up bidirectional relationships
   
2. **JSON:API include parameter is powerful**: 
   - Use `?include=author,category,tags` to sideload relationships
   - All included resources automatically populate the cache
   - WarpDrive links relationships based on schema definitions
   - No manual linking required - it "just works"

3. **Accessing relationships in templates** ⚠️:
   - **Belongs-to**: `@model.post.author.data` - note the `.data` property!
   - **Has-many**: `@model.user.posts.data` - also requires `.data`!
   - Relationships return a `ResourceRelationship` object with structure:
     - `lid` - local identifier
     - `name` - relationship name
     - `data` - the actual related resource(s)
     - `links` - relationship links
     - `meta` - relationship metadata
   - **Correct**: `post.author.data.username` or `post.category.data.name`
   - **Incorrect**: `post.author.username` (missing `.data`)
   - Relationships are reactive - updates propagate automatically

4. **API considerations**:
   - Our API only supports ID-based lookups, not slug-based
   - For SEO-friendly URLs, you need API support for slug lookups
   - Trade-off: numeric IDs (works now) vs slugs (better UX, more work)

5. **Cache is smart**:
   - Fetching a post with `include=author` caches both the post AND the author
   - Later accessing the author directly doesn't require another API call
   - Included resources are first-class cached entities
   - Cache automatically maintains relationship linkage
   - EagerRelationshipLoader checks cache before fetching to avoid duplicates

6. **WarpDrive's async relationship implementation is incomplete**:
   - `linksMode` flag exists but `validateBelongsToLinksMode` throws "not yet implemented" errors
   - Setting `async: true` with links doesn't automatically fetch on access
   - Workaround: Use RequestManager handlers to eagerly pre-fetch relationships
   - This gives us immediate data availability without loading states

7. **RequestManager handlers are powerful**:
   - Can transform request/response data transparently
   - Can make additional requests (pre-fetching, batching)
   - Can inject missing data (like JSON:API links)
   - Chain of responsibility pattern with reversed response flow
   - Perfect for normalizing non-compliant APIs or working around limitations

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

