# WarpDrive Knowledge Base

> **WarpDrive** is the next iteration of ember-data, renamed and redesigned for modern web development. It provides universal, framework-agnostic data management with fine-grained reactivity.

**Source:** [https://canary.warp-drive.io/](https://canary.warp-drive.io/)

**Last Updated:** December 3, 2025

---

## 🚀 Quick Start

- **Installation**: Start with [`installation/index.md`](installation/index.md)
- **Configuration**: See [`configuration/index.md`](configuration/index.md)
- **Basic Usage**: Check [`the-manual/cookbook/basic-usage.md`](the-manual/cookbook/basic-usage.md)

---

## 📚 Documentation Structure

### 1. Installation & Configuration

- **[installation/index.md](installation/index.md)** - Installation instructions for various frameworks (Ember, React, Svelte, Vue, etc.)
- **[configuration/index.md](configuration/index.md)** - Basic setup and configuration
- **[configuration/advanced.md](configuration/advanced.md)** - Advanced configuration options
- **[configuration/ember.md](configuration/ember.md)** - Ember-specific legacy configuration

### 2. The Manual - Core Concepts

#### Requests
Handle HTTP requests and responses:
- **[the-manual/requests/index.md](the-manual/requests/index.md)** - Request management overview
- **[the-manual/requests/typing-requests.md](the-manual/requests/typing-requests.md)** - TypeScript request typing
- **[the-manual/requests/using-the-response.md](the-manual/requests/using-the-response.md)** - Working with responses
- **[the-manual/requests/builders.md](the-manual/requests/builders.md)** - Request builders
- **[the-manual/requests/handlers.md](the-manual/requests/handlers.md)** - Custom request handlers

#### Caching
Understand WarpDrive's caching system:
- **[the-manual/caching/index.md](the-manual/caching/index.md)** - Caching overview
- **[the-manual/caching/key-terms.md](the-manual/caching/key-terms.md)** - Important caching terminology

#### Schemas
Define your data structures:
- **[the-manual/schemas/index.md](the-manual/schemas/index.md)** - Schema system overview
- **[the-manual/schemas/resources.md](the-manual/schemas/resources.md)** - Resource schemas
- **[the-manual/schemas/simple-fields.md](the-manual/schemas/simple-fields.md)** - Simple field types
- **[the-manual/schemas/relational-fields.md](the-manual/schemas/relational-fields.md)** - Relationships between resources
- **[the-manual/schemas/object-schemas.md](the-manual/schemas/object-schemas.md)** - Complex object schemas

#### Concepts (Advanced Topics)
Deep dive into WarpDrive's architecture:
- **[the-manual/concepts/index.md](the-manual/concepts/index.md)** - Advanced concepts introduction
- **[the-manual/concepts/mutations.md](the-manual/concepts/mutations.md)** - Data mutations
- **[the-manual/concepts/operations.md](the-manual/concepts/operations.md)** - Operations system
- **[the-manual/concepts/reactive-control-flow.md](the-manual/concepts/reactive-control-flow.md)** - Reactive programming patterns

### 3. Cookbook (Practical Examples)

- **[the-manual/cookbook/index.md](the-manual/cookbook/index.md)** - Cookbook overview
- **[the-manual/cookbook/basic-usage.md](the-manual/cookbook/basic-usage.md)** - ⭐ Basic usage examples
- **[the-manual/cookbook/auth-handlers.md](the-manual/cookbook/auth-handlers.md)** - Authentication handlers
- **[the-manual/cookbook/incremental-adoption.md](the-manual/cookbook/incremental-adoption.md)** - Migrating existing apps gradually

### 4. Specialized Topics

#### TypeScript Support
- **[the-manual/misc/typescript/index.md](the-manual/misc/typescript/index.md)** - TypeScript integration and best practices

#### Reactivity
- **[the-manual/misc/reactivity/index.md](the-manual/misc/reactivity/index.md)** - Reactivity system overview
- **[the-manual/misc/reactivity/signals.md](the-manual/misc/reactivity/signals.md)** - Working with signals

#### Relational Data
- **[the-manual/misc/relational-data/index.md](the-manual/misc/relational-data/index.md)** - Managing relationships between data

#### Other
- **[the-manual/misc/terminology.md](the-manual/misc/terminology.md)** - Glossary of terms
- **[the-manual/misc/migrating.md](the-manual/misc/migrating.md)** - Migration guides

### 5. Migration & Compatibility

- **[migrating/index.md](migrating/index.md)** - Migrating from ember-data to WarpDrive

### 6. API Reference

#### Core APIs
- **[api/core/index.md](api/core/index.md)** - Core package overview
- **[api/core/Store.md](api/core/Store.md)** - ⭐ Store class - central data management
- **[api/core/RequestManager.md](api/core/RequestManager.md)** - Request management API
- **[api/core/ConfiguredStore.md](api/core/ConfiguredStore.md)** - Pre-configured store

#### Schema APIs
- **[api/schema/schema-record.md](api/schema/schema-record.md)** - Schema record implementation

### 7. Contributing

- **[contributing/index.md](contributing/index.md)** - How to contribute to WarpDrive

---

## 🎯 Key Features of WarpDrive

Based on the documentation, WarpDrive offers:

1. **🧩 Universal Compatibility** - Works with any framework (Ember, React, Vue, Svelte, etc.)
2. **🌌 Fine-Grained Reactivity** - Native reactivity that integrates with any reactive system
3. **📘 TypeScript First** - Fully typed with excellent TypeScript support
4. **🚀 Scalable** - Designed for everything from hobby projects to enterprise applications
5. **🔓 No Lock-in** - Framework-agnostic architecture
6. **⚡ Modern Architecture** - Built for modern web development patterns

---

## 📖 Recommended Reading Path

### For New Modern Ember Projects:

1. **Start Here**: [`installation/index.md`](installation/index.md) - Install WarpDrive
2. **Configure**: [`configuration/index.md`](configuration/index.md) - Set up your app
3. **Learn Basics**: [`the-manual/cookbook/basic-usage.md`](the-manual/cookbook/basic-usage.md) - Basic patterns
4. **Understand Schemas**: [`the-manual/schemas/index.md`](the-manual/schemas/index.md) - Define your data
5. **Handle Requests**: [`the-manual/requests/index.md`](the-manual/requests/index.md) - Work with APIs
6. **Explore Caching**: [`the-manual/caching/index.md`](the-manual/caching/index.md) - Optimize performance
7. **TypeScript Setup**: [`the-manual/misc/typescript/index.md`](the-manual/misc/typescript/index.md) - Add types

### For Migrating from ember-data:

1. **Migration Guide**: [`migrating/index.md`](migrating/index.md)
2. **Incremental Adoption**: [`the-manual/cookbook/incremental-adoption.md`](the-manual/cookbook/incremental-adoption.md)
3. **Terminology Changes**: [`the-manual/misc/terminology.md`](the-manual/misc/terminology.md)

---

## 🔍 Finding Information

### By Topic:
- **Installation** → `installation/`
- **Configuration** → `configuration/`
- **How-to guides** → `the-manual/cookbook/`
- **Concepts** → `the-manual/concepts/`
- **API details** → `api/`

### Common Questions:
- "How do I install WarpDrive?" → [`installation/index.md`](installation/index.md)
- "How do I make a request?" → [`the-manual/requests/index.md`](the-manual/requests/index.md)
- "How do I define my data models?" → [`the-manual/schemas/index.md`](the-manual/schemas/index.md)
- "How does caching work?" → [`the-manual/caching/index.md`](the-manual/caching/index.md)
- "What's the Store API?" → [`api/core/Store.md`](api/core/Store.md)
- "How do I use TypeScript?" → [`the-manual/misc/typescript/index.md`](the-manual/misc/typescript/index.md)

---

## 📝 Notes

- These documentation files were fetched from the canary (bleeding-edge) version of WarpDrive
- Files contain both navigation boilerplate and actual content - scroll past the navigation sections to find the meat
- WarpDrive is actively developed - check the [official site](https://canary.warp-drive.io/) for the latest updates
- Join the community: [Discord](https://discord.gg/PHBbnWJx5S) | [GitHub](https://github.com/warp-drive-data/warp-drive)

---

## 🏗️ Project Structure

```
kb/
├── README.md (this file)
├── installation/
│   └── index.md
├── configuration/
│   ├── index.md
│   ├── advanced.md
│   └── ember.md
├── the-manual/
│   ├── index.md
│   ├── requests/
│   ├── caching/
│   ├── schemas/
│   ├── cookbook/
│   ├── concepts/
│   └── misc/
├── api/
│   ├── core/
│   └── schema/
├── migrating/
└── contributing/
```

---

## 🤝 Core Team

- **Chris Thoburn** - Project Lead | Senior Staff Engineer @auditboard
- **Krystan HuffMenne** - Core Team | Staff Software Engineer @auditboard
- **Rich Glazerman** - Core Team | Software Engineer @square
- **Kirill Shaplyko** - Core Team | Lead Developer @galar

Released under the MIT License | Copyright © 2025 Ember.js and Contributors

