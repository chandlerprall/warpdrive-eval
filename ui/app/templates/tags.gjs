import { pageTitle } from 'ember-page-title';
import DebugPanel from 'ui/components/debug-panel';

<template>
  {{pageTitle "Tags"}}

  <div class="tags-page">
    <header class="page-header">
      <h2>Tags</h2>
      {{#if @model.meta}}
        <p class="muted">
          {{@model.meta.total}} tags
        </p>
      {{/if}}
    </header>

    {{#if @model.error}}
      <div class="error-card">
        <p class="error-title">⚠️ Error Loading Tags</p>
        <p>{{@model.error.message}}</p>
      </div>
    {{else if @model.tags}}
      <div class="tags-cloud">
        {{#each @model.tags as |tag|}}
          <span class="tag-item">
            {{tag.name}}
            <span class="tag-count">{{tag.postCount}}</span>
          </span>
        {{else}}
          <p class="empty-state">No tags found.</p>
        {{/each}}
      </div>

      <DebugPanel @json={{JSON.stringify @model.rawResponse.content null 2}} />
    {{else}}
      <p class="loading">Loading tags...</p>
    {{/if}}
  </div>
</template>

