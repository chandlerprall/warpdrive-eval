import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';
import DebugPanel from 'ui/components/debug-panel';

<template>
  {{pageTitle "Users"}}

  <div class="users-page">
    <header class="page-header">
      <h2>Users</h2>
      {{#if @model.meta}}
        <p class="muted">
          Showing {{@model.meta.count}} of {{@model.meta.total}} users
        </p>
      {{/if}}
    </header>

    {{#if @model.error}}
      <div class="error-card">
        <p class="error-title">⚠️ Error Loading Users</p>
        <p>{{@model.error.message}}</p>
      </div>
    {{else if @model.users}}
      <div class="users-list">
        {{#each @model.users as |user|}}
          <article class="user-card">
            <div class="user-avatar">
              {{#if user.avatarUrl}}
                <img src={{user.avatarUrl}} alt={{user.username}} />
              {{else}}
                <div class="avatar-placeholder">{{user.username.[0]}}</div>
              {{/if}}
            </div>
            <div class="user-info">
              <h3>
                <LinkTo @route="users.detail" @model={{user.id}}>
                  {{user.displayName}}
                </LinkTo>
              </h3>
              <p class="username">@{{user.username}}</p>
              {{#if user.bio}}
                <p class="bio">{{user.bio}}</p>
              {{/if}}
              <p class="muted">Member since {{user.createdAt}}</p>
            </div>
          </article>
        {{else}}
          <p class="empty-state">No users found.</p>
        {{/each}}
      </div>

      <DebugPanel @json={{JSON.stringify @model.rawResponse.content null 2}} />
    {{else}}
      <p class="loading">Loading users...</p>
    {{/if}}
  </div>
</template>

