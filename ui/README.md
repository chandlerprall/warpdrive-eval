# WarpDrive Evaluation - UI

Modern Ember application exploring WarpDrive (next-gen ember-data) patterns.

**📖 Documentation:** See [`docs/`](./docs/) folder  
**🚀 Quick Start:** See [`docs/coldboot.md`](./docs/coldboot.md)  
**🗺️ Roadmap:** See [`docs/plan.md`](./docs/plan.md)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4200)
npm start

# Run tests
npm test

# Lint
npm run lint
```

**Requires:** API server running at `http://localhost:3000` (see `/server/README.md`)

---

## Current Status

**Iteration:** 1 ✅ Complete - Read-Only Lists  
**WarpDrive Version:** 5.8.0  
**Features Working:** Health check, Posts, Users, Categories, Tags (all list routes)  
**Next:** Iteration 2 - Detail views & relationships

---

## Documentation

All project documentation is in the [`docs/`](./docs/) folder:

- **[coldboot.md](./docs/coldboot.md)** - 📖 Main guide (start here!)
- **[plan.md](./docs/plan.md)** - 🗺️ 8-iteration roadmap
- **[ITERATION-1-SUMMARY.md](./docs/ITERATION-1-SUMMARY.md)** - 📊 Iteration 1 learnings
- **[STORE-CONFIGURATION.md](./docs/STORE-CONFIGURATION.md)** - 🔍 Store exploration & comparison

The `coldboot.md` file includes a documentation guide with navigation by use case.

---

## Project Structure

This is a standard Ember application. Below is original Ember README content.

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (with npm)
- [Google Chrome](https://google.com/chrome/)

## Installation

- `git clone <repository-url>` this repository
- `cd ui`
- `npm install`

## Running / Development

- `npm run start`
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `npm exec ember help generate` for more details

### Running Tests

- `npm run test`

### Linting

- `npm run lint`
- `npm run lint:fix`

### Building

- `npm exec vite build --mode development` (development)
- `npm run build` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

- [ember.js](https://emberjs.com/)
- [Vite](https://vite.dev)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
