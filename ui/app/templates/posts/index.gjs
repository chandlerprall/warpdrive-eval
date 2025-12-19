import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';
import DebugPanel from 'ui/components/debug-panel';
import ResolveRelationship from 'ui/components/resolve-relationship';

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

            {{! Relationships loaded on-demand via ResolveRelationship component }}
            <div class="post-relationships">
              <ResolveRelationship @resource={{post.author}} as |author|>
                <p class="relationship-info">
                  ✍️ Author: <strong>{{author.displayName}}</strong> (@{{author.username}})
                </p>
              </ResolveRelationship>

              <ResolveRelationship @resource={{post.category}} as |category|>
                <p class="relationship-info">
                  📁 Category: <strong>{{category.name}}</strong>
                </p>
              </ResolveRelationship>

              {{! Note: Tags are a collection (has-many) - WarpDrive doesn't support accessing collection fields yet }}
              {{!-- 
              <ResolveRelationship @resource={{post.tags}} as |tags|>
                <p class="relationship-info">
                  🏷️ Tags:
                  {{#each tags as |tag|}}
                    <span class="tag-badge">{{tag.name}}</span>
                  {{/each}}
                </p>
              </ResolveRelationship>
              --}}
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

