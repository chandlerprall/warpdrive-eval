import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';

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
          <li><LinkTo @route="posts"><strong>Posts:</strong></LinkTo> Browse published blog posts with detail views</li>
          <li><LinkTo @route="users"><strong>Users:</strong></LinkTo> View all users with profiles and their posts</li>
          <li><LinkTo @route="categories"><strong>Categories:</strong></LinkTo> Explore post categories</li>
          <li><LinkTo @route="tags"><strong>Tags:</strong></LinkTo> See all available tags</li>
        </ul>
      </section>

      <section class="info-card">
        <h3>📚 Documentation</h3>
        <ul>
          <li><a href="https://canary.warp-drive.io" target="_blank" rel="noopener noreferrer">WarpDrive Official Docs</a></li>
          <li><a href="https://github.com/warp-drive-data/warp-drive" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
          <li>Local docs in <code>/docs</code> folder</li>
        </ul>
      </section>

      <section class="info-card">
        <h3>🎯 Current Iteration</h3>
        <p>
          <strong>Iteration 2:</strong> ✅ Complete - Detail Views & Relationships
        </p>
        <p class="muted">
          Posts and users now have detail pages with relationship support. Belongs-to relationships
          (post author, category) work via the ResolveRelationship component. Has-many relationships
          are defined but not yet accessible due to WarpDrive limitations.
        </p>
      </section>
    </div>
  </div>
</template>

