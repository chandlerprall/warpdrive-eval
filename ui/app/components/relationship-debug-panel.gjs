import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { gt, eq } from 'ember-truth-helpers';

/**
 * RelationshipDebugPanel Component
 *
 * Visual debug panel for monitoring relationship fetches and detecting N+1 patterns.
 * Shows time-based buckets with fetch details, patterns, and optimization suggestions.
 *
 * Features:
 * - Overall statistics summary
 * - Time-based buckets with expand/collapse
 * - N+1 pattern detection and recommendations
 * - Per-bucket detailed fetch logs
 * - Clear history and expand/collapse all controls
 *
 * @example
 * <RelationshipDebugPanel />
 */
export default class RelationshipDebugPanelComponent extends Component {
  @service relationshipMonitor;

  @tracked isVisible = false;
  @tracked expandedBuckets = new Set(); // Track which buckets are expanded

  /**
   * Toggle panel visibility
   */
  togglePanel = () => {
    this.isVisible = !this.isVisible;
  };

  /**
   * Toggle a specific bucket's expanded state
   */
  toggleBucket = (bucketId) => {
    if (this.expandedBuckets.has(bucketId)) {
      this.expandedBuckets.delete(bucketId);
    } else {
      this.expandedBuckets.add(bucketId);
    }
    // Trigger reactivity
    this.expandedBuckets = new Set(this.expandedBuckets);
  };

  /**
   * Expand all buckets
   */
  expandAll = () => {
    const buckets = this.relationshipMonitor.getAllBuckets();
    this.expandedBuckets = new Set(buckets.map(b => b.id));
  };

  /**
   * Collapse all buckets
   */
  collapseAll = () => {
    this.expandedBuckets = new Set();
  };

  /**
   * Clear all bucket history
   */
  clearHistory = () => {
    this.relationshipMonitor.clearHistory();
    this.expandedBuckets = new Set();
  };

  /**
   * Check if a bucket is expanded
   */
  isBucketExpanded = (bucketId) => {
    return this.expandedBuckets.has(bucketId);
  }

  /**
   * Get bucket number (1-indexed)
   */
  getBucketNumber(index) {
    return index + 1;
  }

  /**
   * Count network requests in fetches
   */
  countNetworkRequests(fetches) {
    return fetches.filter(f => !f.cacheHit).length;
  }

  /**
   * Count cache hits in fetches
   */
  countCacheHits(fetches) {
    return fetches.filter(f => f.cacheHit).length;
  }

  /**
   * Format timestamp for display
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  /**
   * Format duration for display
   */
  formatDuration(startTime, endTime) {
    return `${(endTime - startTime).toFixed(0)}ms`;
  }

  /**
   * Get bucket status emoji
   */
  getBucketStatus(bucket) {
    if (bucket.patterns.length > 0) {
      return '⚠️';
    }
    return '✅';
  }

  /**
   * Group fetches by relationship type for display
   */
  groupFetchesByType(fetches) {
    const groups = new Map();

    for (const fetch of fetches) {
      const key = `${fetch.relationshipType}:${fetch.relationshipName}`;

      if (!groups.has(key)) {
        groups.set(key, {
          relationshipType: fetch.relationshipType,
          relationshipName: fetch.relationshipName,
          fetches: []
        });
      }

      groups.get(key).fetches.push(fetch);
    }

    return Array.from(groups.values());
  }

  <template>
    <div class="relationship-debug-panel">
      {{! Toggle Button }}
      <button
        type="button"
        class="debug-toggle relationship-debug-toggle"
        {{on "click" this.togglePanel}}
      >
        {{if this.isVisible "▼" "▶"}}
        Relationship Monitor
        {{#if (gt this.relationshipMonitor.buckets.length 0)}}
          <span class="badge-count">{{this.relationshipMonitor.buckets.length}}</span>
        {{/if}}
      </button>

        {{#if this.isVisible}}
          <div class="debug-content relationship-debug-content">
            {{#let this.relationshipMonitor.stats as |stats|}}

              {{! Overall Summary }}
            <section class="relationship-summary">
              <h4>📊 Overview</h4>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">Total Buckets:</span>
                  <span class="summary-value">{{stats.totalBuckets}}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Active Patterns:</span>
                  <span class="summary-value {{if (gt stats.totalPatterns 0) 'warning'}}">
                    {{stats.totalPatterns}}
                    {{if (gt stats.totalPatterns 0) "⚠️" "✅"}}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Total Fetches:</span>
                  <span class="summary-value">{{stats.totalFetches}}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Network Requests:</span>
                  <span class="summary-value">{{stats.networkRequests}}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Cache Hits:</span>
                  <span class="summary-value success">{{stats.cacheHits}}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Bucket Window:</span>
                  <span class="summary-value">{{stats.bucketThreshold}}ms</span>
                </div>
              </div>
            </section>

            {{! Controls }}
            <section class="relationship-controls">
              <button
                type="button"
                class="control-button"
                {{on "click" this.expandAll}}
              >
                Expand All
              </button>
              <button
                type="button"
                class="control-button"
                {{on "click" this.collapseAll}}
              >
                Collapse All
              </button>
              <button
                type="button"
                class="control-button danger"
                {{on "click" this.clearHistory}}
              >
                Clear History
              </button>
            </section>

            {{! Buckets List }}
            {{#if (eq stats.totalBuckets 0)}}
              <section class="relationship-empty">
                <p class="muted">No relationship fetches tracked yet. Navigate to pages with relationships to see data.</p>
              </section>
            {{else}}
              <section class="relationship-buckets">
                {{#each this.relationshipMonitor.buckets as |bucket index|}}
                  {{#let (this.isBucketExpanded bucket.id) as |isExpanded|}}
                    <div class="bucket-item">
                      {{! Bucket Header }}
                      <button
                        type="button"
                        class="bucket-header"
                        {{on "click" (fn this.toggleBucket bucket.id)}}
                      >
                        <span class="bucket-icon">
                          {{if isExpanded "▼" "▶"}}
                        </span>
                        <span class="bucket-title">
                          {{this.getBucketStatus bucket}}
                          Bucket #{{this.getBucketNumber index}}
                          <span class="bucket-time">({{this.formatTime bucket.startTime}})</span>
                        </span>
                        <span class="bucket-meta">
                          {{bucket.fetches.length}} fetches
                          {{#if (gt bucket.patterns.length 0)}}
                            • {{bucket.patterns.length}} pattern(s)
                          {{/if}}
                        </span>
                      </button>

                      {{! Bucket Details (Expanded) }}
                      {{#if isExpanded}}
                        <div class="bucket-details">
                          {{! Bucket Summary }}
                          <div class="bucket-summary">
                            <strong>Time Range:</strong>
                            {{this.formatTime bucket.startTime}} - {{this.formatTime bucket.endTime}}
                            ({{this.formatDuration bucket.startTime bucket.endTime}})
                            <br>
                            <strong>Total Fetches:</strong> {{bucket.fetches.length}}
                            ({{this.countNetworkRequests bucket.fetches}} network,
                            {{this.countCacheHits bucket.fetches}} cache)
                          </div>

                          {{! Detected Patterns }}
                          {{#if (gt bucket.patterns.length 0)}}
                            <div class="bucket-patterns">
                              {{#each bucket.patterns as |pattern|}}
                                <div class="pattern-item n+1-pattern">
                                  <div class="pattern-header">
                                    ⚠️ N+1 Pattern Detected
                                  </div>
                                  <div class="pattern-details">
                                    <strong>Relationship:</strong> {{pattern.relationshipName}} (type: {{pattern.relationshipType}})<br>
                                    <strong>Fetches:</strong> {{pattern.count}} network requests<br>
                                    <strong>Parent:</strong> {{pattern.parentType}} ({{pattern.uniqueParents}} unique IDs)
                                  </div>
                                  <div class="pattern-suggestion">
                                    💡 <strong>Recommendation:</strong><br>
                                    {{pattern.suggestion}}
                                  </div>
                                </div>
                              {{/each}}
                            </div>
                          {{else}}
                            <div class="bucket-patterns">
                              <div class="pattern-item optimal">
                                ✅ No patterns detected - optimal performance
                              </div>
                            </div>
                          {{/if}}

                          {{! Detailed Fetch Log }}
                          <div class="bucket-fetches">
                            <strong>🔍 Detailed Fetch Log:</strong>
                            {{#each (this.groupFetchesByType bucket.fetches) as |group|}}
                              <div class="fetch-group">
                                <div class="fetch-group-header">
                                  {{group.relationshipName}} ({{group.relationshipType}}) - {{group.fetches.length}} fetch(es)
                                </div>
                                <ol class="fetch-list">
                                  {{#each group.fetches as |fetch|}}
                                    <li class="fetch-item {{if fetch.cacheHit 'cache-hit'}}">
                                      {{#if fetch.parentType}}
                                        <strong>{{fetch.parentType}}#{{fetch.parentId}}.{{fetch.relationshipName}}</strong>
                                        →
                                      {{/if}}
                                      {{fetch.relationshipType}}
                                      <span class="fetch-meta">
                                        ({{fetch.duration}}ms)
                                        {{if fetch.cacheHit "[cache hit] ✅" "[network]"}}
                                      </span>
                                      <br>
                                      <code class="fetch-url">{{fetch.url}}</code>
                                    </li>
                                  {{/each}}
                                </ol>
                              </div>
                            {{/each}}
                          </div>
                        </div>
                      {{/if}}
                    </div>
                  {{/let}}
                {{/each}}
              </section>
            {{/if}}
          {{/let}}
        </div>
      {{/if}}
    </div>
  </template>
}

