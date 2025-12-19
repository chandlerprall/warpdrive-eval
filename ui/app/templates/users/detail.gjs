import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';
import DebugPanel from 'ui/components/debug-panel';

<template>
  {{#if @model.user}}
    {{pageTitle @model.user.displayName}}
  {{else}}
    {{pageTitle "User Not Found"}}
  {{/if}}

  <div class="user-detail-page">
    <nav class="breadcrumb">
      <LinkTo @route="users">← Back to Users</LinkTo>
    </nav>

    {{#if @model.error}}
      <div class="error-card">
        <p class="error-title">⚠️ Error Loading User</p>
        <p>{{@model.error.message}}</p>
      </div>
    {{else if @model.user}}
      <div class="user-detail">
        <header class="user-header">
          {{#if @model.user.avatarUrl}}
            <img src={{@model.user.avatarUrl}} alt={{@model.user.displayName}} class="avatar-large" />
          {{/if}}
          <div>
            <h1>{{@model.user.displayName}}</h1>
            <p class="muted">@{{@model.user.username}}</p>
          </div>
        </header>

        {{#if @model.user.bio}}
          <section class="user-section">
            <h3>Bio</h3>
            <p>{{@model.user.bio}}</p>
          </section>
        {{/if}}

        <section class="user-section">
          <h3>Contact</h3>
          <p>{{@model.user.email}}</p>
        </section>

        {{! User's Posts (has-many relationship)
            COMMENTED OUT: WarpDrive doesn't yet support accessing collection fields
            See: https://github.com/warp-drive-data/warp-drive/blob/4d2f2cbf3bbbfcd62d07f1b6fe778a2472dbb975/warp-drive-packages/core/src/reactive/-private/kind/collection-field.ts#L9
            The relationship is defined in the schema and data is cached, but accessing it throws:
            "Accessing collection fields is not yet implemented"

            When WarpDrive implements collection field access, this would use ResolveRelationship:
        }}
        {{!--
        <section class="user-section">
          <h3>Posts</h3>
          <ResolveRelationship @resource={{@model.user.posts}} as |posts|>
            {{#if posts}}
              <div class="posts-grid">
                {{#each posts as |post|}}
                  <article class="post-card">
                    <h4>
                      <LinkTo @route="posts.detail" @model={{post.id}}>
                        {{post.title}}
                      </LinkTo>
                    </h4>
                    {{#if post.excerpt}}
                      <p class="excerpt">{{post.excerpt}}</p>
                    {{/if}}
                    <div class="post-meta">
                      <span class="badge">{{post.status}}</span>
                      <span class="muted">
                        ❤️ {{post.likeCount}} | 💬 {{post.commentCount}}
                      </span>
                    </div>
                  </article>
                {{else}}
                  <p class="muted">No posts yet</p>
                {{/each}}
              </div>
            {{else}}
              <p class="muted">No posts yet</p>
            {{/if}}
          </ResolveRelationship>
        </section>
        --}}
      </div>

      {{! Debug panel }}
      <DebugPanel @json={{JSON.stringify @model.rawResponse.content null 2}} />
    {{else}}
      <p class="loading">Loading user...</p>
    {{/if}}
  </div>
</template>

