import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * RelationshipMonitor Service
 *
 * Tracks relationship fetches and detects N+1 patterns using time-based bucketing.
 *
 * Bucketing Strategy:
 * - Creates a new bucket when gap between fetches > 100ms
 * - Each bucket is independent and analyzed for N+1 patterns
 * - Keeps last 50 buckets in memory (FIFO)
 *
 * N+1 Detection:
 * - Groups fetches by relationship type within a bucket
 * - If 3+ fetches of same type with same parent type → N+1 pattern
 */
export default class RelationshipMonitorService extends Service {
  @tracked buckets = [];

  bucketThreshold = 100;  // ms - create new bucket if gap > this
  maxBuckets = 50;        // Keep last N buckets (prevent memory leak)
  n1Threshold = 3;        // Min fetches to trigger N+1 warning
  lastFetchTime = null;   // Timestamp of most recent fetch

  /**
   * Track a relationship fetch
   *
   * @param {Object} fetchData
   * @param {string} fetchData.relationshipType - Type being fetched (e.g., 'user')
   * @param {string} fetchData.relationshipName - Field name (e.g., 'author')
   * @param {string} fetchData.parentType - Parent resource type (e.g., 'post')
   * @param {string} fetchData.parentId - Parent resource ID (e.g., '1')
   * @param {number} fetchData.timestamp - When fetch started (ms since epoch)
   * @param {number} fetchData.duration - How long fetch took (ms)
   * @param {boolean} fetchData.cacheHit - Was data already cached?
   * @param {string} fetchData.url - Request URL
   */
  trackFetch(fetchData) {
    const now = fetchData.timestamp;
    const timeSinceLastFetch = this.lastFetchTime ? (now - this.lastFetchTime) : Infinity;

    if (timeSinceLastFetch > this.bucketThreshold) {
      // Create new bucket
      const newBucket = {
        id: `bucket-${now}`,
        startTime: now,
        endTime: now,
        fetches: [fetchData],
        patterns: []
      };

      // Add to front (newest first)
      this.buckets = [newBucket, ...this.buckets];

      // Enforce max bucket limit
      if (this.buckets.length > this.maxBuckets) {
        this.buckets = this.buckets.slice(0, this.maxBuckets);
      }
    } else {
      // Add to current bucket (most recent)
      if (this.buckets.length === 0) {
        // Edge case: first fetch ever
        this.buckets = [{
          id: `bucket-${now}`,
          startTime: now,
          endTime: now,
          fetches: [fetchData],
          patterns: []
        }];
      } else {
        const currentBucket = this.buckets[0];
        currentBucket.fetches = [...currentBucket.fetches, fetchData];
        currentBucket.endTime = now;

        // Trigger reactivity
        this.buckets = [...this.buckets];
      }
    }

    this.lastFetchTime = now;

    // Analyze patterns for current bucket
    this.analyzePatterns(this.buckets[0]);
  }

  /**
   * Analyze a bucket for N+1 patterns
   *
   * @param {Object} bucket
   */
  analyzePatterns(bucket) {
    if (!bucket || bucket.fetches.length === 0) {
      return;
    }

    // Group fetches by relationship type
    const fetchesByType = new Map();

    for (const fetch of bucket.fetches) {
      // Skip cache hits - they're not network requests
      if (fetch.cacheHit) {
        continue;
      }

      const key = `${fetch.relationshipType}:${fetch.relationshipName}`;

      if (!fetchesByType.has(key)) {
        fetchesByType.set(key, {
          relationshipType: fetch.relationshipType,
          relationshipName: fetch.relationshipName,
          fetches: [],
          parentTypes: new Set(),
          parentIds: new Set()
        });
      }

      const group = fetchesByType.get(key);
      group.fetches.push(fetch);
      if (fetch.parentType) group.parentTypes.add(fetch.parentType);
      if (fetch.parentId) group.parentIds.add(fetch.parentId);
    }

    // Detect N+1 patterns
    const patterns = [];

    for (const [, group] of fetchesByType.entries()) {
      if (group.fetches.length >= this.n1Threshold) {
        // Potential N+1: multiple fetches of same relationship type
        const parentType = group.parentTypes.size === 1
          ? Array.from(group.parentTypes)[0]
          : 'mixed';

        patterns.push({
          type: 'n+1',
          relationshipType: group.relationshipType,
          relationshipName: group.relationshipName,
          count: group.fetches.length,
          parentType,
          uniqueParents: group.parentIds.size,
          suggestion: this.generateSuggestion(group),
          fetchIds: group.fetches.map((f, i) => i) // Indices in bucket.fetches
        });
      }
    }

    // Update bucket patterns
    bucket.patterns = patterns;

    // Trigger reactivity
    this.buckets = [...this.buckets];
  }

  /**
   * Generate optimization suggestion for a fetch group
   *
   * @param {Object} group - Grouped fetches
   * @returns {string}
   */
  generateSuggestion(group) {
    const { relationshipName, fetches } = group;
    const count = fetches.length;

    return `Add ?include=${relationshipName} to your request builder to reduce ${count} requests to 1`;
  }

  /**
   * Get all buckets (newest first)
   *
   * @returns {Array}
   */
  getAllBuckets() {
    return this.buckets;
  }

  /**
   * Get a specific bucket by ID
   *
   * @param {string} bucketId
   * @returns {Object|null}
   */
  getBucket(bucketId) {
    return this.buckets.find(b => b.id === bucketId) || null;
  }

  /**
   * Get the active bucket (most recent, if within threshold)
   *
   * @returns {Object|null}
   */
  getActiveBucket() {
    if (this.buckets.length === 0) {
      return null;
    }

    const mostRecent = this.buckets[0];
    const now = Date.now();
    const timeSinceLastFetch = now - mostRecent.endTime;

    // Consider bucket "active" if last fetch was within threshold
    if (timeSinceLastFetch <= this.bucketThreshold) {
      return mostRecent;
    }

    return null;
  }

  /**
   * Clear all buckets
   */
  clearHistory() {
    this.buckets = [];
    this.lastFetchTime = null;
  }

  /**
   * Get statistics across all buckets
   *
   * @returns {Object}
   */
  get stats() {
    const totalFetches = this.buckets.reduce((sum, b) => sum + b.fetches.length, 0);
    const totalPatterns = this.buckets.reduce((sum, b) => sum + b.patterns.length, 0);
    const networkRequests = this.buckets.reduce((sum, b) => {
      return sum + b.fetches.filter(f => !f.cacheHit).length;
    }, 0);
    const cacheHits = this.buckets.reduce((sum, b) => {
      return sum + b.fetches.filter(f => f.cacheHit).length;
    }, 0);

    return {
      totalBuckets: this.buckets.length,
      totalFetches,
      networkRequests,
      cacheHits,
      totalPatterns,
      bucketThreshold: this.bucketThreshold
    };
  }
}

