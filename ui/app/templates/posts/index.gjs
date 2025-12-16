import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';
import DebugPanel from 'ui/components/debug-panel';

<template>
  {{pageTitle "Posts"}}

  <div class="posts-page">
    <header class="page-header">
      <h2>Published Posts</h2>
      {{#if @model.meta}}
        <p class="muted">
          Showing {{@model.meta.count}} of {{@model.meta.total}} posts
        </p>
      {{/if}}
    </header>

    {{#if @model.error}}
      <div class="error-card">
        <p class="error-title">⚠️ Error Loading Posts</p>
        <p>{{@model.error.message}}</p>
      </div>
    {{else if @model.posts}}
      <div class="posts-list">
        {{#each @model.posts as |post|}}
          <article class="post-card">
            <h3>
              <LinkTo @route="posts.detail" @model={{post.id}}>
                {{post.title}}
              </LinkTo>
            </h3>
            {{#if post.excerpt}}
              <p class="excerpt">{{post.excerpt}}</p>
            {{/if}}

            {{! ASYNC RELATIONSHIPS EXPLORATION }}
            <div class="post-relationships">
              {{#if post.author.data}}
                <p class="relationship-info">
                  ✍️ Author: <strong>{{post.author.data.displayName}}</strong> (@{{post.author.data.username}})
                </p>
              {{/if}}

              {{#if post.category.data}}
                <p class="relationship-info">
                  📁 Category: <strong>{{post.category.data.name}}</strong>
                </p>
              {{/if}}

              {{! Note: Tags are a collection (has-many), may not be accessible yet per WarpDrive limitations }}
              {{!-- {{#if post.tags.data}}
                <p class="relationship-info">
                  🏷️ Tags:
                  {{#each post.tags.data as |tag|}}
                    <span class="tag-badge">{{tag.name}}</span>
                  {{/each}}
                </p>
              {{/if}} --}}
            </div>

            <div class="post-meta">
              <span class="badge">{{post.status}}</span>
              {{#if post.publishedAt}}
                <span class="muted">Published: {{post.publishedAt}}</span>
              {{/if}}
              <span class="muted">
                ❤️ {{post.likeCount}} | 💬 {{post.commentCount}} | 👁 {{post.viewCount}}
              </span>
            </div>
          </article>
        {{else}}
          <p class="empty-state">No published posts found.</p>
        {{/each}}
      </div>

      {{! Debug panel for learning - shows raw API response }}
      <DebugPanel @json={{JSON.stringify @model.rawResponse.content null 2}} />
    {{else}}
      <p class="loading">Loading posts...</p>
    {{/if}}
  </div>
</template>

