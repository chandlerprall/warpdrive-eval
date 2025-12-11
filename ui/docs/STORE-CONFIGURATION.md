# Store Configuration in WarpDrive

**Date:** December 11, 2024  
**Status:** ✅ Complete - Using useLegacyStore  
**WarpDrive Version:** 5.8.0

This document explores three approaches for configuring a WarpDrive Store, documenting our exploration journey and the insights we gained.

---

## 🔍 The Exploration Journey

This exploration demonstrates our learning principle: **"Explore multiple valid paths when unclear; sometimes the best understanding comes from exploring alternatives and synthesizing insights."**

### Path 1: Manual Implementation (Educational)

**What we tried:**
```js
import { Store } from '@warp-drive/core';
import { SchemaService, instantiateRecord, teardownRecord } from '@warp-drive/core/reactive';

export default class ApplicationStoreService extends Store {
  constructor(...args) {
    super(...args);
    this.requestManager = createRequestManager().useCache(CacheHandler);
    registerPostSchema(this);
  }
  
  createSchemaService() {
    const schema = new SchemaService();
    registerDerivations(schema);
    return schema;
  }
  
  createCache(capabilities) {
    return new JSONAPICache(capabilities);
  }
  
  instantiateRecord(identifier, createArgs) {
    return instantiateRecord(this, identifier, createArgs);
  }
  
  teardownRecord(record) {
    return teardownRecord(record);
  }
}
```

**Result:** ✅ Worked perfectly! ~75 lines of code

**What we learned:**
- Store requires exactly 4 methods to function
- Each method serves a specific purpose
- Full control over every piece
- Great for understanding WarpDrive internals

**Pros:**
- Full control and visibility
- Highly educational
- Maximum customization
- Flexible RequestManager setup

**Cons:**
- Lots of boilerplate (4 methods)
- Easy to forget required methods
- More maintenance burden
- Manual updates if Store requirements change

**Outcome:** Saved as `app/services/store-manual.js.bak` for reference

---

### Path 2: useRecommendedStore (The Discovery)

**What we tried:**
```js
import { useRecommendedStore } from '@warp-drive/core';

const StoreClass = useRecommendedStore({
  cache: JSONAPICache,
  handlers: [BaseURLHandler, LoggingHandler],
  schemas: [],
});
```

**Result:** ❌ Import error - function not exported!

**The Discovery:**
- Found `useRecommendedStore` in [WarpDrive source code](https://github.com/warp-drive-data/warp-drive/blob/main/warp-drive-packages/core/src/index.ts#L130)
- Fully implemented and documented in the codebase
- But **not exported** from `@warp-drive/core` in v5.8.0
- Likely coming in v6.0+ as the official recommended approach

**What we learned:**
- Source code ≠ public API
- Future features can exist in repo but not be available yet
- Always verify exports, not just implementation
- Documentation can reference features not yet released

**When Available (v6+):**
- Will be the recommended approach for new apps
- Cleaner than manual (~20 lines estimated)
- Should provide same benefits as useLegacyStore without the confusing name

**Outcome:** Can't use yet, but now we know what's coming!

---

### Path 3: useLegacyStore (The Solution)

**What we tried:**
```js
import { useLegacyStore } from '@warp-drive/legacy';
import { JSONAPICache } from '@warp-drive/json-api';
import { BaseURLHandler, LoggingHandler } from 'ui/utils/request-manager';

const StoreClass = useLegacyStore({
  cache: JSONAPICache,
  linksMode: false,         // Disable legacy feature
  legacyRequests: false,    // Disable legacy feature  
  modelFragments: false,    // Disable legacy feature
  handlers: [BaseURLHandler, LoggingHandler],
  schemas: [],
});

export default class ApplicationStoreService extends StoreClass {
  constructor(...args) {
    super(...args);
    registerPostSchema(this);
  }
}
```

**Result:** ✅ Works perfectly! ~30 lines of code (60% reduction from manual)

**What we learned:**
- "Legacy" doesn't mean "old" - it means "migration support"
- By disabling legacy flags, we get pure modern patterns
- This is the v5.x equivalent of `useRecommendedStore`
- Endorsed by WarpDrive team for current v5.x projects
- Easy migration path when `useRecommendedStore` becomes available

**Why "Legacy" is Actually Forward-Compatible:**

Despite the name, `useLegacyStore` uses WarpDrive's modern patterns. The "legacy" refers to **optional** migration features that help teams transition from old ember-data patterns:
- `linksMode`: Support for links-based relationships (ember-data pattern)
- `legacyRequests`: Support for old request methods
- `modelFragments`: Support for model fragments

**By setting all these to `false`**, we get a clean, modern Store implementation identical to what `useRecommendedStore` will provide in v6+.

**Pros:**
- Less boilerplate (~75 lines → ~30 lines)
- Available now in v5.8.0
- Factory provides sensible defaults
- Future-compatible with v6
- Automatic wiring of all components
- Easy migration path to useRecommendedStore

**Cons:**
- Confusing name (sounds old, but it's modern)
- Requires `@warp-drive/legacy` package
- Less explicit (factory handles details)
- Must remember to disable legacy flags
- Handler array format (not chained)

**Outcome:** Current implementation in `app/services/store.js` ✅

---

## 📊 Complete Comparison

| Aspect | Manual | useRecommendedStore | useLegacyStore ✅ |
|--------|--------|---------------------|-------------------|
| **Available in v5.8?** | ✅ Yes | ❌ No (v6+) | ✅ Yes |
| **Lines of Code** | ~75 | ~20 (est.) | ~30 |
| **Boilerplate** | High (4 methods) | None | None |
| **Required Methods** | Implement manually | Automatic | Automatic |
| **Cache Policy** | Must configure | Default included | Default included |
| **Package** | `@warp-drive/core` | `@warp-drive/core` | `@warp-drive/legacy` |
| **Learning Value** | Very High | Medium | Medium |
| **Maintenance** | Higher | Lowest | Lowest |
| **Control** | Maximum | Good | Good |
| **Modern Patterns** | ✅ Yes | ✅ Yes | ✅ Yes (flags off) |
| **Future-proof** | ❌ Manual updates | ✅ Automatic | ✅ Easy migration |
| **Our Choice** | Learning phase | Can't use yet | **Production** |

---

## 🎯 Our Decision

### Current Implementation: useLegacyStore ✅

**Rationale:**
1. **Available now**: Works in v5.8.0 (unlike useRecommendedStore)
2. **Cleaner code**: 60% reduction in code (75 → 30 lines)
3. **Modern patterns**: All legacy flags disabled
4. **Forward-compatible**: Easy migration to v6
5. **Allows custom handlers**: BaseURL and Logging still work
6. **Educational value preserved**: We learned manual approach first

**Trade-offs Accepted:**
- Name suggests "legacy" but it's actually modern
- Requires `@warp-drive/legacy` package
- Some abstraction (less explicit than manual)
- Must remember to disable legacy flags

**Why This Makes Sense:**
- We achieved educational value via manual implementation
- We understand what's happening under the hood
- We're using WarpDrive's endorsed v5.x migration path
- Trivial to switch to `useRecommendedStore` when available

### What We're NOT Doing

We're **not** using legacy ember-data patterns:
- ❌ No `linksMode: true` (no links-based relationships)
- ❌ No `legacyRequests: true` (no old request methods)
- ❌ No `modelFragments: true` (no model fragments)
- ❌ No `@ember-data/` imports anywhere

We **are** using WarpDrive's modern Store factory pattern that happens to live in the legacy package for v5.x compatibility.

---

## 🔄 Migration Paths

### From Manual → useLegacyStore
```diff
- import { Store } from '@warp-drive/core';
- import { SchemaService, registerDerivations, instantiateRecord, teardownRecord } from '@warp-drive/core/reactive';
+ import { useLegacyStore } from '@warp-drive/legacy';

- export default class ApplicationStoreService extends Store {
+ const StoreClass = useLegacyStore({
+   cache: JSONAPICache,
+   linksMode: false,
+   legacyRequests: false,
+   modelFragments: false,
+   handlers: [BaseURLHandler, LoggingHandler],
+   schemas: [],
+ });
+
+ export default class ApplicationStoreService extends StoreClass {
    constructor(...args) {
      super(...args);
-     this.requestManager = createRequestManager().useCache(CacheHandler);
      registerPostSchema(this);
    }
-
-   createSchemaService() { /* removed */ }
-   createCache(capabilities) { /* removed */ }
-   instantiateRecord(identifier, createArgs) { /* removed */ }
-   teardownRecord(record) { /* removed */ }
  }
```

### From useLegacyStore → useRecommendedStore (when available in v6)
```diff
- import { useLegacyStore } from '@warp-drive/legacy';
+ import { useRecommendedStore } from '@warp-drive/core';

- const StoreClass = useLegacyStore({
+ const StoreClass = useRecommendedStore({
    cache: JSONAPICache,
-   linksMode: false,
-   legacyRequests: false,
-   modelFragments: false,
    handlers: [BaseURLHandler, LoggingHandler],
    schemas: [],
  });
```

That's it! Just 3 lines change for v6 migration.

---

## 💡 Key Insights

### 1. Multiple Valid Paths Don't Need "Correction"

All three approaches are valid for different contexts:
- **Manual**: Best when learning internals or need maximum control
- **useRecommendedStore**: Best for future (v6+) new projects
- **useLegacyStore**: Best for current (v5.x) projects wanting factory benefits

There's no single "correct" answer - it depends on:
- What version of WarpDrive you're using
- Whether you're learning or shipping
- How much control vs. convention you need
- Your migration timeline

### 2. "Legacy" Can Mean "Forward-Compatible"

Don't be scared by the name! `useLegacyStore`:
- Is a migration helper, not legacy code
- Provides the same modern factory pattern as future `useRecommendedStore`
- With legacy features disabled, it's pure modern WarpDrive
- Is the WarpDrive team's recommended approach for v5.x apps
- Provides a smooth bridge to v6's patterns

### 3. Exploration Leads to Deeper Understanding

By trying all three approaches, we now understand:
- **What** the Store needs internally (4 specific methods and their purposes)
- **Why** factory patterns reduce boilerplate and maintenance
- **When** to use each approach (version availability matters)
- **How** to migrate between them (straightforward path)
- **Where** WarpDrive is heading (v6 patterns)

We wouldn't have this comprehensive knowledge if we'd just used the first working approach!

### 4. Source Code ≠ Public API

Important lesson: Just because code exists in the repository doesn't mean it's exported for use.

**Always verify:**
- Check actual exports in package entry points
- Try importing before assuming availability
- Test with your version, not just latest source
- Read release notes for export changes
- Ask in Discord when documentation and reality differ

---

## 🎓 Takeaway

**This exploration exemplifies our "explore multiple paths" principle perfectly:**

We didn't know the "right" way to configure the Store. Instead of guessing or picking the first thing that worked, we:

1. **Tried manual approach** → Learned Store internals
2. **Found "better" way in docs** → Discovered it's not available yet
3. **Found practical alternative** → Understood naming confusion  
4. **Synthesized understanding** → Made informed decision

**Now we have:**
- ✅ Working implementation (useLegacyStore)
- ✅ Reference implementation (store-manual.js.bak)
- ✅ Knowledge of future approach (useRecommendedStore)
- ✅ Clear migration path for v6
- ✅ Deep understanding of all options
- ✅ Confidence in our choice

**That's the power of exploration over prescription.**

No single path was "wrong" - each taught us something valuable, and together they gave us comprehensive understanding.

---

## 📚 References

- [WarpDrive Advanced Configuration](https://canary.warp-drive.io/guides/configuration/advanced)
- [useLegacyStore API Docs](https://canary.warp-drive.io/api/@warp-drive/legacy/functions/useLegacyStore)
- [useRecommendedStore Source (not yet exported)](https://github.com/warp-drive-data/warp-drive/blob/main/warp-drive-packages/core/src/index.ts#L130)
- Local KB: `/kb/configuration/advanced.md`
- Local: `app/services/store-manual.js.bak` (manual implementation reference)
- Local: `app/services/store.js` (current implementation)

---

## 📂 Related Files

- **`app/services/store.js`** - Current useLegacyStore implementation
- **`app/services/store-manual.js.bak`** - Manual implementation backup
- **`ITERATION-1-SUMMARY.md`** - Full Iteration 1 technical summary

