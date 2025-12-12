import { pageTitle } from 'ember-page-title';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

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

      <DebugPanel @json={{JSON.stringify @model.rawResponse null 2}} />
    {{else}}
      <p class="loading">Loading tags...</p>
    {{/if}}
  </div>
</template>

