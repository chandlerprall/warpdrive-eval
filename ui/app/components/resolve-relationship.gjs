import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { next } from '@ember/runloop';

/**
 * ResolveRelationship Component
 *
 * Accepts a WarpDrive ResourceRelationship and automatically fetches it if needed.
 * Yields the resolved ReactiveResource back for use in templates.
 *
 * Usage:
 *   <ResolveRelationship
 *     @resource={{@model.post.author}}
 *     @parentType="post"
 *     @parentId={{@model.post.id}}
 *     as |author|
 *   >
 *     <h3>{{author.displayName}}</h3>
 *     <p>{{author.bio}}</p>
 *   </ResolveRelationship>
 *
 * Features:
 * - Skips fetch if data is already loaded
 * - Shows loading state during fetch
 * - Handles errors gracefully
 * - Reactive: yields the ReactiveResource directly
 * - Tracks fetches for N+1 detection (via RelationshipMonitor service)
 *
 * Args:
 * - @resource (required): ResourceRelationship object from WarpDrive
 * - @parentType (optional): Type of parent resource (e.g., "post")
 * - @parentId (optional): ID of parent resource (e.g., "1")
 */
export default class ResolveRelationshipComponent extends Component {
  @service relationshipMonitor;

  @tracked isLoading = true;
  @tracked error = null;
  @tracked data = null;

  constructor(owner, args) {
    super(owner, args);
    this.loadRelationship();
  }

  async loadRelationship() {
    const { resource, parentType, parentId } = this.args;

    if (!resource) {
      this.error = 'No resource provided';
      this.isLoading = false;
      return;
    }

    // Extract relationship metadata
    const relationshipName = resource.name || 'unknown';

    // Extract relationship type from URL (e.g., /api/users/123 -> users)
    const relationshipType = this.extractTypeFromUrl(resource.links?.related);

    // Check if data is already loaded (cache hit)
    const isAlreadyLoaded = !!resource.data;

    if (isAlreadyLoaded) {
      // Cache hit - track it
      this.trackFetch({
        relationshipName,
        relationshipType,
        parentType,
        parentId,
        duration: 0,
        cacheHit: true,
        url: resource.links?.related || 'unknown'
      });

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

    // Track network fetch timing
    const startTime = performance.now();

    try {
      const response = await resource.fetch();
      const duration = performance.now() - startTime;

      this.data = response.content.data;

      // Track the network fetch
      this.trackFetch({
        relationshipName,
        relationshipType,
        parentType,
        parentId,
        duration,
        cacheHit: false,
        url: resource.links?.related || 'unknown'
      });

      this.isLoading = false;
    } catch (err) {
      console.error('Failed to fetch relationship:', err);
      this.error = err.message || 'Failed to load relationship';
      this.isLoading = false;
    }
  }

  /**
   * Extract resource type from a JSON:API URL
   *
   * Examples:
   * - /api/users/123 -> users
   * - http://localhost:3000/api/categories/5 -> categories
   *
   * @param {string} url
   * @returns {string}
   */
  extractTypeFromUrl(url) {
    if (!url) return 'unknown';

    try {
      // Remove query params and hash
      const cleanUrl = url.split('?')[0].split('#')[0];

      // Split by / and get the second-to-last segment (before the ID)
      const segments = cleanUrl.split('/').filter(Boolean);

      // For /api/users/123, segments = ['api', 'users', '123']
      // We want 'users' (second to last)
      if (segments.length >= 2) {
        return segments[segments.length - 2];
      }

      return 'unknown';
    } catch (err) {
      console.warn('Failed to extract type from URL:', url, err);
      return 'unknown';
    }
  }

  /**
   * Track a relationship fetch with the monitor service
   *
   * Scheduled with next() to avoid updating tracked properties during render
   *
   * @param {Object} data
   */
  trackFetch(data) {
    // Schedule tracking for next runloop to avoid updating during render
    next(() => {
      try {
        this.relationshipMonitor.trackFetch({
          relationshipType: data.relationshipType,
          relationshipName: data.relationshipName,
          parentType: data.parentType || 'unknown',
          parentId: data.parentId || 'unknown',
          timestamp: Date.now(),
          duration: data.duration,
          cacheHit: data.cacheHit,
          url: data.url
        });
      } catch (err) {
        // Fail silently - monitoring shouldn't break the app
        console.warn('Failed to track relationship fetch:', err);
      }
    });
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


