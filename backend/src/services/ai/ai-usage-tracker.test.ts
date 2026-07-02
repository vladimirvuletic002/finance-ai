import { test } from 'node:test';
import assert from 'node:assert/strict';
import AIUsageTracker from './ai-usage-tracker.js';

// Each test uses its own userId so buckets (module-level, per-user Map state)
// never leak between tests.
let nextUserId = 1_000_000;
function freshUserId() {
    return nextUserId++;
}

test('allows consumption up to the given limit', () => {
    const userId = freshUserId();

    assert.equal(AIUsageTracker.tryConsume(userId, 3), true);
    assert.equal(AIUsageTracker.tryConsume(userId, 3), true);
    assert.equal(AIUsageTracker.tryConsume(userId, 3), true);
});

test('blocks consumption once the limit is reached, without incrementing further', () => {
    const userId = freshUserId();

    assert.equal(AIUsageTracker.tryConsume(userId, 1), true);
    assert.equal(AIUsageTracker.tryConsume(userId, 1), false);
    assert.equal(AIUsageTracker.tryConsume(userId, 1), false);
});

test('remaining() reflects consumption against the given limit', () => {
    const userId = freshUserId();

    assert.equal(AIUsageTracker.remaining(userId, 5), 5);
    AIUsageTracker.tryConsume(userId, 5);
    assert.equal(AIUsageTracker.remaining(userId, 5), 4);
    AIUsageTracker.tryConsume(userId, 5);
    assert.equal(AIUsageTracker.remaining(userId, 5), 3);
});

test('remaining() never goes below zero', () => {
    const userId = freshUserId();

    AIUsageTracker.tryConsume(userId, 1);
    AIUsageTracker.tryConsume(userId, 1);
    AIUsageTracker.tryConsume(userId, 1);

    assert.equal(AIUsageTracker.remaining(userId, 1), 0);
});

test('tracks each user independently', () => {
    const userA = freshUserId();
    const userB = freshUserId();

    assert.equal(AIUsageTracker.tryConsume(userA, 1), true);
    assert.equal(AIUsageTracker.tryConsume(userA, 1), false);

    // userB has its own, untouched bucket.
    assert.equal(AIUsageTracker.tryConsume(userB, 1), true);
});
