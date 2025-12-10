# WarpDrive UI Iteration Plan

Goal: build an Ember (v6+) UI that exercises WarpDrive against the provided test API in `/server`, evolving features incrementally while emphasizing learning and reusable patterns.

## Guiding Principles
- Ship in slices: end-to-end vertical cuts that hit the API, the store, and UI.
- Keep feedback tight: run the API locally, add minimal fixtures, and validate with Ember tests.
- Prefer boring defaults first; layer WarpDrive patterns (schemas, requests, caching) as we go.
- Preserve learning: document gotchas, questions, and decisions after each iteration.

## Prereqs
- API: `cd server && npm install && npm start` (assumed base URL `http://localhost:3000/api`).
- UI: `cd ui && npm start` (Vite dev server).
- Add environment wiring: in `ui/config/environment.js`, surface `API_HOST` and `API_NAMESPACE` for fetchers.

## Iteration 0 — Scaffold & Plumbing
- Configure lint/format (eslint, template lint, prettier) and CI script.
- Add `.env` support for API host/namespace; create a tiny `config/api.js` helper to centralize URLs.
- Install WarpDrive packages (store + request manager) and bootstrap a minimal store singleton.
- Add a shared fetch util that logs requests/responses to aid learning.
- Checklist: app boots; store is constructed; health check to `/api` works.

## Iteration 1 — Read-Only Lists (Users, Posts)
- Define schemas for `users`, `posts`, `categories`, `tags` matching server docs.
- Implement list routes for users and posts with sorting/pagination params.
- Render simple tables/cards; show meta (count/total/pages) to validate pagination wiring.
- Add loading/error states; surface raw payload in a collapsible debug panel for learning.
- Tests: route rendering smoke tests + a minimal contract test for list fetch shape.

## Iteration 2 — Detail Views + Includes
- Post detail route: fetch post with `include=author,category,tags`.
- User detail route: fetch user and their posts (filtered by `authorId`).
- Demonstrate sparse fieldsets on list vs. detail to show payload-size impact.
- Add “view raw response” toggles to highlight JSON:API shapes.

## Iteration 3 — Threaded Comments
- Schema for comments (self-referential belongsTo/hasMany).
- Show top-level comments with `filter[parentCommentId]=null`; lazy-load replies per comment.
- Provide optimistic UI for expanding replies; add loading/error indicators per thread.
- Tests: rendering of nested threads; ensures parent/child linkage renders correctly.

## Iteration 4 — Mutations: Create & Edit Posts
- Add forms for create/update posts using JSON:API write format.
- Demonstrate request typing (TS) and client-side validation before send.
- On success, update store and navigate; on failure, display server error detail.
- Track mutation state (submitting/success/error) with a reusable hook/helper.

## Iteration 5 — Social Interactions (Follows, Likes)
- Wire follow/unfollow on user detail; surface follower/following counts from meta.
- Wire like/unlike on posts and comments (polymorphic likeableType/id).
- Show optimistic toggles with rollback on failure; update cached counts.

## Iteration 6 — Caching & Pagination Strategy
- Introduce WarpDrive caching primitives: keying, cache invalidation on mutations.
- Add “Refresh” and “Use cache” toggles to illustrate cache hits/misses.
- Explore infinite scroll for posts with `page[number]`/`page[size]` and merge into store.

## Iteration 7 — DX Enhancements
- Devtools-style inspector: show current store state for a resource type.
- Logging middleware for the request manager; feature-flaggable.
- Accessibility and perf passes on critical routes; lazy-load route chunks.

## Iteration 8 — Hardening & Docs
- Add route-level tests for happy/edge/error cases (404s, validation failures).
- Add contract tests against the API using recorded fixtures.
- Write short “What we learned” notes per iteration; keep in `docs/notes/`.

## Risks & Watchpoints
- JSON:API nuances: includes vs. relationships, sparse fieldsets, pagination meta shapes.
- Self-referential and polymorphic relationships (comments, likes) can surface cache edge cases.
- Keep API host configurable; avoid hardcoding `localhost:3000`.
- Guard against overfetching; use fieldsets and includes deliberately.

## Definition of Done (per iteration)
- A working vertical slice demo-able in the browser.
- Lint/tests green for touched areas.
- Notes updated with learnings, open questions, and next bets.

