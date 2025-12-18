import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';
import DebugPanel from 'ui/components/debug-panel';
import ResolveRelationship from 'ui/components/resolve-relationship';

<template>
  {{#if @model.post}}
    {{pageTitle @model.post.title}}
  {{else}}
    {{pageTitle "Post Not Found"}}
  {{/if}}

  <div class="post-detail-page">
    <nav class="breadcrumb">
      <LinkTo @route="posts">← Back to Posts</LinkTo>
    </nav>

    {{#if @model.error}}
      <div class="error-card">
        <p class="error-title">⚠️ Error Loading Post</p>
        <p>{{@model.error.message}}</p>
      </div>
    {{else if @model.post}}
      <article class="post-detail">
        <header class="post-header">
          <h1>{{@model.post.title}}</h1>
          <div class="post-meta">
            <span class="badge">{{@model.post.status}}</span>
            {{#if @model.post.publishedAt}}
              <span class="muted">Published: {{@model.post.publishedAt}}</span>
            {{/if}}
          </div>
        </header>

        {{! Post Content }}
        {{#if @model.post.body}}
          <div class="post-body">
            <p>{{@model.post.body}}</p>
          </div>
        {{/if}}

        {{! Author Info (belongs-to relationship) }}
        <section class="post-section">
          <h3>Author</h3>
          <ResolveRelationship @resource={{@model.post.author}} as |author|>
            <div class="author-card">
              <h4>
                <LinkTo @route="users.detail" @model={{author.id}}>
                  {{author.displayName}}
                </LinkTo>
              </h4>
              <p class="muted">@{{author.username}}</p>
              {{#if author.bio}}
                <p>{{author.bio}}</p>
              {{/if}}
            </div>
          </ResolveRelationship>
        </section>

        {{! Category Info (belongs-to relationship) }}
        <section class="post-section">
          <h3>Category</h3>
          <ResolveRelationship @resource={{@model.post.category}} as |category|>
            <div class="category-card">
              <h4>{{category.name}}</h4>
              {{#if category.description}}
                <p>{{category.description}}</p>
              {{/if}}
            </div>
          </ResolveRelationship>
        </section>

        {{! Tags (has-many relationship)
            COMMENTED OUT: WarpDrive doesn't yet support accessing collection fields
            See: https://github.com/warp-drive-data/warp-drive/blob/4d2f2cbf3bbbfcd62d07f1b6fe778a2472dbb975/warp-drive-packages/core/src/reactive/-private/kind/collection-field.ts#L9
            The relationship is defined in the schema and data is cached, but accessing it throws:
            "Accessing collection fields is not yet implemented"

            This will be re-enabled when WarpDrive implements collection field access.
        }}
        {{!--
        {{#if @model.post.tags.data}}
          <section class="post-section">
            <h3>Tags</h3>
            <div class="tags-list">
              {{#each @model.post.tags.data as |tag|}}
                <span class="tag">{{tag.name}}</span>
              {{else}}
                <p class="muted">No tags</p>
              {{/each}}
            </div>
          </section>
        {{/if}}
        --}}

        {{! Post Stats }}
        <section class="post-section">
          <h3>Stats</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">{{@model.post.viewCount}}</span>
              <span class="stat-label">Views</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{@model.post.likeCount}}</span>
              <span class="stat-label">Likes</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{@model.post.commentCount}}</span>
              <span class="stat-label">Comments</span>
            </div>
          </div>
        </section>
      </article>

      {{! Debug panel }}
      <DebugPanel @json={{JSON.stringify @model.rawResponse.content null 2}} />
    {{else}}
      <p class="loading">Loading post...</p>
    {{/if}}
  </div>
</template>


