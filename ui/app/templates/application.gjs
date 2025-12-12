import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';

<template>
  {{pageTitle "WarpDrive UI"}}

  <div class="shell">
    <header class="app-header">
      <div>
        <p class="eyebrow">WarpDrive / Ember</p>
        <h1>WarpDrive Test UI</h1>
        <p class="lede">
          Targeting <code>{{@model.apiHost}}</code>
          {{#if @model.apiNamespace}}/<code>{{@model.apiNamespace}}</code>{{/if}}
        </p>
      </div>

      <div class="status-card" data-state={{@model.health.state}}>
        <p class="eyebrow">Health</p>
        {{#if @model.health.isOk}}
          <p class="status ok">healthy</p>
          {{#if @model.health.detail}}
            <p class="muted">Last check: {{@model.health.detail.timestamp}}</p>
          {{/if}}
        {{else}}
          <p class="status error">unreachable</p>
          {{#if @model.health.detail}}
            <p class="muted">
              {{@model.health.detail}}
            </p>
          {{/if}}
        {{/if}}
      </div>
    </header>

    <nav class="app-nav">
      <LinkTo @route="index">Home</LinkTo>
      <LinkTo @route="posts">Posts</LinkTo>
      <LinkTo @route="users">Users</LinkTo>
      <LinkTo @route="categories">Categories</LinkTo>
      <LinkTo @route="tags">Tags</LinkTo>
    </nav>

    <main class="app-main">
      {{outlet}}
    </main>
  </div>
</template>
