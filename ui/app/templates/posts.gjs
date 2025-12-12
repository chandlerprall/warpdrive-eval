import { pageTitle } from 'ember-page-title';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

/**
 * Simple toggle component for showing/hiding debug info
 */
class DebugPanel extends Component {
  @tracked isExpanded = false;

  toggle = () => {
    this.isExpanded = !this.isExpanded;
  };

  <template>
    <div class="debug-panel">
      <button type="button" class="debug-toggle" {{on "click" this.toggle}}>
        {{if this.isExpanded "▼" "▶"}}
        Debug: Raw Response
      </button>
      {{#if this.isExpanded}}
        <pre class="debug-content">{{@json}}</pre>
      {{/if}}
    </div>
  </template>
}

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
            <h3>{{post.title}}</h3>
            {{#if post.excerpt}}
              <p class="excerpt">{{post.excerpt}}</p>
            {{/if}}
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

