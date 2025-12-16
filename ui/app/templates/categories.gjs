import { pageTitle } from 'ember-page-title';
import DebugPanel from 'ui/components/debug-panel';

<template>
  {{pageTitle "Categories"}}

  <div class="categories-page">
    <header class="page-header">
      <h2>Categories</h2>
      {{#if @model.meta}}
        <p class="muted">
          {{@model.meta.total}} categories
        </p>
      {{/if}}
    </header>

    {{#if @model.error}}
      <div class="error-card">
        <p class="error-title">⚠️ Error Loading Categories</p>
        <p>{{@model.error.message}}</p>
      </div>
    {{else if @model.categories}}
      <div class="categories-grid">
        {{#each @model.categories as |category|}}
          <article class="category-card">
            <h3>{{category.name}}</h3>
            {{#if category.description}}
              <p class="description">{{category.description}}</p>
            {{/if}}
            <p class="muted">{{category.postCount}} posts</p>
          </article>
        {{else}}
          <p class="empty-state">No categories found.</p>
        {{/each}}
      </div>

      <DebugPanel @json={{JSON.stringify @model.rawResponse.content null 2}} />
    {{else}}
      <p class="loading">Loading categories...</p>
    {{/if}}
  </div>
</template>

