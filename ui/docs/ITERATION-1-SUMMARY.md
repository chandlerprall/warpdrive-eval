# Iteration 1 Summary: Read-Only Posts List (Partial)

**Completed:** December 11, 2024  
**Status:** 🔄 Partial - Posts complete, Users/Categories/Tags pending

---

## 🎯 Goals Achieved (Posts Only)

**Completed:**
- ✅ Post schema defined and registered with store
- ✅ `/posts` route renders list of published posts from API
- ✅ No errors in browser console
- ✅ Request/response logs visible in console
- ✅ Data flows through complete pipeline: Request → Cache → Reactive Records → Template

**Remaining for Full Iteration 1 (per plan.md):**
- ❌ User schema and `/users` list route
- ❌ Category schema and `/categories` list route  
- ❌ Tag schema and `/tags` list route
- ❌ Tests (route rendering smoke tests + contract tests)

**Scope Note:** We focused on posts as a complete vertical slice to learn the patterns. The remaining resources (users, categories, tags) should now be straightforward to implement using the same patterns.

---

## 📦 Files Created/Modified

### New Files
1. **`app/models/post.js`** - Post ResourceSchema with all attributes
2. **`app/builders/posts.js`** - Request builders following WarpDrive pattern
3. **`app/routes/posts.js`** - Posts list route using builder
4. **`app/templates/posts.gjs`** - Posts list template with debug panel
5. **`app/services/store-manual.js.bak`** - Backup of manual Store implementation
6. **`STORE-APPROACHES.md`** - Comparison of Store configuration approaches
7. **`ITERATION-1-SUMMARY.md`** - This file

### Modified Files
1. **`app/services/store.js`** - Switched to `useRecommendedStore` approach
2. **`app/utils/request-manager.js`** - Exported handlers as objects (not factory)
3. **`app/router.js`** - Added posts route
4. **`app/templates/application.gjs`** - Added navigation with Posts link
5. **`app/styles/app.css`** - Added styling for posts, navigation, debug panel
6. **`coldboot.md`** - Updated status, learnings, and next steps

---

## 🧠 Key Technical Learnings

### 1. Store Configuration
**Discovery:** WarpDrive Store requires specific methods to function

**Three Approaches Explored:**
- **Approach 1 - Manual**: Implement 4 methods manually (~75 lines)
- **Approach 2 - useRecommendedStore**: Found in source, but NOT exported in v5.6.0! (coming in v6+)
- **Approach 3 - useLegacyStore**: Available now, provides factory benefits (~30 lines)

**Decision:** Adopted `useLegacyStore` after discovering `useRecommendedStore` isn't available yet
- Cleaner code (75 lines → 30 lines, 60% reduction)
- Factory pattern with sensible defaults
- Disable legacy flags for pure modern patterns
- Easy migration to `useRecommendedStore` when v6 arrives
- Retained manual implementation as backup for reference (store-manual.js.bak)

**Perfect Example of Exploration:** We tried three paths, discovered one doesn't exist yet, found the practical alternative, and now deeply understand all options.

### 2. Schema Type Matching
**Issue:** Error "Expected schema for 'posts' but found 'post'"

**Root Cause:** Schema `type` field must match API response exactly
- API returns: `"type": "posts"` (plural)
- Schema had: `type: 'post'` (singular)

**Fix:** Changed schema to `type: 'posts'`

**Lesson:** Schema type is case-sensitive and must match character-for-character

### 3. Builder Pattern
**Issue:** Tried importing non-existent `query` from `@warp-drive/json-api/request`

**Discovery:** WarpDrive recommends builder functions that return plain objects

**Pattern:**
```js
// Builder returns plain object
export function queryPublishedPosts() {
  return {
    url: '/posts?filter[status]=published',
    method: 'GET',
    headers: new Headers({ ... })
  };
}

// Use builder with store
const response = await store.request(queryPublishedPosts());
```

**Lesson:** Builders are simple functions returning request objects, not wrapper APIs

### 4. Headers Format
**Issue:** Error "headers should be an instance of Headers, received object"

**Root Cause:** RequestManager expects `Headers` instances, not plain objects

**Fix:** Changed from `headers: { ... }` to `headers: new Headers({ ... })`

**Lesson:** Always use `new Headers()` in request objects

### 5. Request Handler Export Pattern
**Discovery:** Handlers can be exported directly as objects

**Before (factory pattern):**
```js
export function createRequestManager() {
  const manager = new RequestManager();
  manager.use([BaseURLHandler, LoggingHandler, Fetch]);
  return manager;
}
```

**After (direct exports):**
```js
export const BaseURLHandler = { async request(context, next) { ... } };
export const LoggingHandler = { async request(context, next) { ... } };
```

**Benefit:** Handlers can be used directly in `useRecommendedStore` options

---

## 🔄 Data Flow Understanding

We now understand the complete data flow in WarpDrive:

```
1. Route calls builder
   ↓
2. Builder returns plain request object { url, method, headers }
   ↓
3. store.request(requestObject)
   ↓
4. RequestManager processes through handler chain:
   - BaseURLHandler: Adds API base URL to relative paths
   - LoggingHandler: Logs request with timing
   - Fetch: Executes HTTP request
   - CacheHandler: Processes response through cache
   ↓
5. JSONAPICache:
   - Validates response against schema
   - Stores data in cache
   - Creates resource identifiers
   ↓
6. Store.instantiateRecord():
   - Creates reactive record instances from cache
   - Wires up reactivity/tracking
   ↓
7. Template receives reactive records
   - Auto-updates when data changes
   - Can access fields directly (post.title, post.status, etc.)
```

---

## 🎨 UI Features Implemented

### Posts List Page (`/posts`)
- Card-based layout showing published posts
- Each card displays:
  - Post title
  - Excerpt (if available)
  - Status badge
  - Publication date
  - Engagement metrics (likes, comments, views)
- Hover effects and modern styling
- Responsive design

### Debug Panel
- Collapsible panel showing raw JSON:API response
- Helps understand what data the API returns
- Useful for learning and debugging
- Toggle with ▶/▼ indicator

### Navigation
- Home and Posts links in header
- Active state styling
- Consistent with app theme

---

## 🐛 Issues Encountered & Resolved

| Issue | Cause | Solution |
|-------|-------|----------|
| `this.createSchemaService is not a function` | Store methods not implemented | Implemented 4 required methods |
| `Invalid Request: headers should be Headers` | Plain object used for headers | Changed to `new Headers({...})` |
| `No schema defined for posts` | Type mismatch: 'post' vs 'posts' | Changed schema type to 'posts' |
| `this.store.instantiateRecord is not a function` | Missing method implementation | Added instantiateRecord/teardownRecord |
| Import error with `@warp-drive/json-api/request` | Non-existent module | Switched to builder pattern |

---

## 📊 Success Metrics

- ✅ **Zero console errors** when loading posts page
- ✅ **Request logs visible** showing full request/response cycle
- ✅ **5 published posts displayed** from API
- ✅ **Meta information correct** (count, total, pagination)
- ✅ **Debug panel functional** showing raw JSON:API response
- ✅ **Navigation working** between Home and Posts
- ✅ **All linters passing** (no errors or warnings)
- ✅ **useLegacyStore working** with v5.8.0 (60% less code than manual)
- ✅ **App running smoothly** with factory-based Store configuration

---

## 🔮 Questions for Completing Iteration 1

1. Should we implement all 4 list routes (users, categories, tags)?
   - Or is the posts pattern sufficient learning for now?
   - How much is repetitive vs. new learning?

2. Can we reuse the builder pattern?
   - Make generic `queryResources(type, options)` builder?
   - Or keep resource-specific builders?

3. Do tests need to wait?
   - Or should we add them now while fresh?

## 🔮 Questions for Iteration 2 (After Full Iteration 1)

1. How do we define relationships in schemas?
   - `kind: 'resource'` for belongs-to?
   - `kind: 'collection'` for has-many?

2. How does `include` parameter work?
   - Does it automatically populate relationships?
   - How do we access included data in templates?

3. How do we fetch a single post by ID?
   - New builder for `GET /posts/:id`?
   - How to pass dynamic ID to builder?

4. How do we navigate to detail routes?
   - `<LinkTo @route="posts.show" @model={{post}}>`?
   - Does WarpDrive provide helpers?

5. How does the cache handle included resources?
   - Are they stored separately?
   - Can we access them without re-fetching?

---

## 📚 Resources Referenced

- [WarpDrive Configuration Guide](https://canary.warp-drive.io/guides/configuration/advanced)
- [Request Builders Guide](https://canary.warp-drive.io/guides/the-manual/requests/builders)
- [ResourceSchemas Guide](https://canary.warp-drive.io/guides/the-manual/schemas/resources)
- [useRecommendedStore Source Code](https://github.com/warp-drive-data/warp-drive/blob/main/warp-drive-packages/core/src/index.ts#L130)
- Local KB: `/kb/configuration/advanced.md`
- Local KB: `/kb/the-manual/requests/builders.md`
- Local KB: `/kb/the-manual/schemas/resources.md`

---

**Next:** See `plan.md` for Iteration 2 details (Detail Views & Relationships)

