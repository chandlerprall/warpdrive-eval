import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * ResolveRelationship Component
 *
 * Accepts a WarpDrive ResourceRelationship and automatically fetches it if needed.
 * Yields the resolved ReactiveResource back for use in templates.
 *
 * Usage:
 *   <ResolveRelationship @resource={{@model.post.author}} as |author|>
 *     <h3>{{author.displayName}}</h3>
 *     <p>{{author.bio}}</p>
 *   </ResolveRelationship>
 *
 * Features:
 * - Skips fetch if data is already loaded
 * - Shows loading state during fetch
 * - Handles errors gracefully
 * - Reactive: yields the ReactiveResource directly
 */
export default class ResolveRelationshipComponent extends Component {
  @tracked isLoading = true;
  @tracked error = null;
  @tracked data = null;

  constructor(owner, args) {
    super(owner, args);
    this.loadRelationship();
  }

  async loadRelationship() {
    const { resource } = this.args;

    if (!resource) {
      this.error = 'No resource provided';
      this.isLoading = false;
      return;
    }

    // If data is already loaded, skip fetch
    if (resource.data) {
      this.isLoading = false;
      this.data = resource.data;
      return;
    }

    // Check if fetch method exists
    if (typeof resource.fetch !== 'function') {
      this.error = 'Resource does not have a fetch method';
      this.isLoading = false;
      return;
    }

    try {
      const response = await resource.fetch();
      this.data = response.content.data;
      this.isLoading = false;
    } catch (err) {
      console.error('Failed to fetch relationship:', err);
      this.error = err.message || 'Failed to load relationship';
      this.isLoading = false;
    }
  }

  <template>
    {{#if this.error}}
      <div class="error-card">
        <p class="error-title">⚠️ Error Loading Relationship</p>
        <p>{{this.error}}</p>
      </div>
    {{else if this.isLoading}}
      <div class="loading">Loading...</div>
    {{else}}
      {{yield this.data}}
    {{/if}}
  </template>
}


