import { module, test } from 'qunit';
import { setupTest } from 'ui/tests/helpers';

module('Unit | Service | relationship-monitor', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');
    assert.ok(service);
  });

  test('creates a new bucket for first fetch', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: 1000,
      duration: 50,
      cacheHit: false,
      url: '/api/users/1'
    });

    assert.strictEqual(service.buckets.length, 1, 'creates one bucket');
    assert.strictEqual(service.buckets[0].fetches.length, 1, 'bucket has one fetch');
  });

  test('adds to existing bucket when within threshold', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: 1000,
      duration: 50,
      cacheHit: false,
      url: '/api/users/1'
    });

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '2',
      timestamp: 1050, // 50ms later - within 100ms threshold
      duration: 50,
      cacheHit: false,
      url: '/api/users/2'
    });

    assert.strictEqual(service.buckets.length, 1, 'still one bucket');
    assert.strictEqual(service.buckets[0].fetches.length, 2, 'bucket has two fetches');
  });

  test('creates new bucket when exceeding threshold', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: 1000,
      duration: 50,
      cacheHit: false,
      url: '/api/users/1'
    });

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '2',
      timestamp: 1150, // 150ms later - exceeds 100ms threshold
      duration: 50,
      cacheHit: false,
      url: '/api/users/2'
    });

    assert.strictEqual(service.buckets.length, 2, 'creates two buckets');
    assert.strictEqual(service.buckets[0].fetches.length, 1, 'newest bucket has one fetch');
    assert.strictEqual(service.buckets[1].fetches.length, 1, 'oldest bucket has one fetch');
  });

  test('detects N+1 pattern with 3+ fetches', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    // Add 3 fetches of same relationship type within bucket
    for (let i = 1; i <= 3; i++) {
      service.trackFetch({
        relationshipType: 'user',
        relationshipName: 'author',
        parentType: 'post',
        parentId: String(i),
        timestamp: 1000 + (i * 10),
        duration: 50,
        cacheHit: false,
        url: `/api/users/${i}`
      });
    }

    const bucket = service.buckets[0];
    assert.strictEqual(bucket.patterns.length, 1, 'detects one pattern');
    assert.strictEqual(bucket.patterns[0].type, 'n+1', 'pattern type is n+1');
    assert.strictEqual(bucket.patterns[0].count, 3, 'pattern has 3 fetches');
    assert.strictEqual(bucket.patterns[0].relationshipName, 'author', 'correct relationship name');
  });

  test('does not detect N+1 with fewer than 3 fetches', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    // Add only 2 fetches
    for (let i = 1; i <= 2; i++) {
      service.trackFetch({
        relationshipType: 'user',
        relationshipName: 'author',
        parentType: 'post',
        parentId: String(i),
        timestamp: 1000 + (i * 10),
        duration: 50,
        cacheHit: false,
        url: `/api/users/${i}`
      });
    }

    const bucket = service.buckets[0];
    assert.strictEqual(bucket.patterns.length, 0, 'no patterns detected');
  });

  test('ignores cache hits in N+1 detection', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    // Add 3 fetches, but 2 are cache hits
    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: 1000,
      duration: 50,
      cacheHit: false,
      url: '/api/users/1'
    });

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: 1010,
      duration: 2,
      cacheHit: true, // Cache hit
      url: '/api/users/1'
    });

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '2',
      timestamp: 1020,
      duration: 2,
      cacheHit: true, // Cache hit
      url: '/api/users/2'
    });

    const bucket = service.buckets[0];
    assert.strictEqual(bucket.patterns.length, 0, 'no patterns detected (cache hits ignored)');
  });

  test('clearHistory removes all buckets', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: 1000,
      duration: 50,
      cacheHit: false,
      url: '/api/users/1'
    });

    assert.strictEqual(service.buckets.length, 1, 'has buckets');

    service.clearHistory();

    assert.strictEqual(service.buckets.length, 0, 'buckets cleared');
    assert.strictEqual(service.lastFetchTime, null, 'lastFetchTime reset');
  });

  test('enforces max bucket limit', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');
    service.maxBuckets = 3; // Override for test

    // Create 5 buckets (exceeds limit)
    for (let i = 0; i < 5; i++) {
      service.trackFetch({
        relationshipType: 'user',
        relationshipName: 'author',
        parentType: 'post',
        parentId: String(i),
        timestamp: 1000 + (i * 200), // 200ms apart - creates new buckets
        duration: 50,
        cacheHit: false,
        url: `/api/users/${i}`
      });
    }

    assert.strictEqual(service.buckets.length, 3, 'enforces max bucket limit');
  });

  test('stats getter returns correct aggregated data', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');
    
    // Add some fetches with mix of cache hits and misses
    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: 1000,
      duration: 50,
      cacheHit: false,
      url: '/api/users/1'
    });

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '2',
      timestamp: 1010,
      duration: 2,
      cacheHit: true,
      url: '/api/users/2'
    });

    const stats = service.stats;
    
    assert.strictEqual(stats.totalBuckets, 1, 'correct bucket count');
    assert.strictEqual(stats.totalFetches, 2, 'correct total fetches');
    assert.strictEqual(stats.networkRequests, 1, 'correct network requests');
    assert.strictEqual(stats.cacheHits, 1, 'correct cache hits');
  });

  test('getActiveBucket returns most recent bucket within threshold', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    const now = Date.now();

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: now - 50, // 50ms ago - within threshold
      duration: 50,
      cacheHit: false,
      url: '/api/users/1'
    });

    const activeBucket = service.getActiveBucket();
    assert.ok(activeBucket, 'returns active bucket');
    assert.strictEqual(activeBucket.id, service.buckets[0].id, 'returns most recent bucket');
  });

  test('getActiveBucket returns null when last fetch exceeds threshold', function (assert) {
    const service = this.owner.lookup('service:relationship-monitor');

    const now = Date.now();

    service.trackFetch({
      relationshipType: 'user',
      relationshipName: 'author',
      parentType: 'post',
      parentId: '1',
      timestamp: now - 200, // 200ms ago - exceeds threshold
      duration: 50,
      cacheHit: false,
      url: '/api/users/1'
    });

    const activeBucket = service.getActiveBucket();
    assert.strictEqual(activeBucket, null, 'returns null when threshold exceeded');
  });
});

