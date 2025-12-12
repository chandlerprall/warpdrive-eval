import { pageTitle } from 'ember-page-title';

<template>
  {{pageTitle "Home"}}

  <div class="home-page">
    <header class="page-header">
      <h2>Welcome to WarpDrive UI</h2>
      <p class="muted">
        Exploring WarpDrive (next-gen ember-data) with a modern Ember application
      </p>
    </header>

    <div class="home-content">
      <section class="info-card">
        <h3>🚀 Quick Links</h3>
        <ul>
          <li><strong>Posts:</strong> Browse published blog posts</li>
          <li><strong>Users:</strong> View all users with profiles</li>
          <li><strong>Categories:</strong> Explore post categories</li>
          <li><strong>Tags:</strong> See all available tags</li>
        </ul>
      </section>

      <section class="info-card">
        <h3>📚 Documentation</h3>
        <ul>
          <li><a href="https://canary.warp-drive.io" target="_blank" rel="noopener">WarpDrive Official Docs</a></li>
          <li><a href="https://github.com/warp-drive-data/warp-drive" target="_blank" rel="noopener">GitHub Repository</a></li>
          <li>Local docs in <code>/docs</code> folder</li>
        </ul>
      </section>

      <section class="info-card">
        <h3>🎯 Current Iteration</h3>
        <p>
          <strong>Iteration 1:</strong> ✅ Complete - Read-Only Lists
        </p>
        <p class="muted">
          All four resource types (posts, users, categories, tags) have working list routes
          with schemas, builders, and templates following WarpDrive patterns.
        </p>
      </section>
    </div>
  </div>
</template>

