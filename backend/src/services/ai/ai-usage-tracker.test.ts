import { test } from 'node:test';
import assert from 'node:assert/strict';
import AIUsageTracker from './ai-usage-tracker.js';

// tryConsume/remaining are now async (they await the shared fixed-window
// store). With no REDIS_URL set the store is in-memory, so these tests stay
// fast and deterministic. Each test uses its own userId so counters (keyed by
// userId) never leak between tests.
let nextUserId = 1_000_000;
function freshUserId() {
    return nextUserId++;
}

test('allows consumption up to the given limit', async () => {
    const userId = freshUserId();

    assert.equal(await AIUsageTracker.tryConsume(userId, 3), true);
    assert.equal(await AIUsageTracker.tryConsume(userId, 3), true);
    assert.equal(await AIUsageTracker.tryConsume(userId, 3), true);
});

test('blocks consumption once the limit is reached, without incrementing further', async () => {
    const userId = freshUserId();

    assert.equal(await AIUsageTracker.tryConsume(userId, 1), true);
    assert.equal(await AIUsageTracker.tryConsume(userId, 1), false);
    assert.equal(await AIUsageTracker.tryConsume(userId, 1), false);
});

test('remaining() reflects consumption against the given limit', async () => {
    const userId = freshUserId();

    assert.equal(await AIUsageTracker.remaining(userId, 5), 5);
    await AIUsageTracker.tryConsume(userId, 5);
    assert.equal(await AIUsageTracker.remaining(userId, 5), 4);
    await AIUsageTracker.tryConsume(userId, 5);
    assert.equal(await AIUsageTracker.remaining(userId, 5), 3);
});

test('remaining() never goes below zero', async () => {
    const userId = freshUserId();

    await AIUsageTracker.tryConsume(userId, 1);
    await AIUsageTracker.tryConsume(userId, 1);
    await AIUsageTracker.tryConsume(userId, 1);

    assert.equal(await AIUsageTracker.remaining(userId, 1), 0);
});

test('tracks each user independently', async () => {
    const userA = freshUserId();
    const userB = freshUserId();

    assert.equal(await AIUsageTracker.tryConsume(userA, 1), true);
    assert.equal(await AIUsageTracker.tryConsume(userA, 1), false);

    // userB has its own, untouched bucket.
    assert.equal(await AIUsageTracker.tryConsume(userB, 1), true);
});
