import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aiUsageLimitMiddleware } from './ai-usage-limit.middleware.js';
import AIUsageTracker, { AI_DAILY_USAGE_LIMIT } from '../services/ai/ai-usage-tracker.js';
import { HttpException } from '../utils/http-exception.js';

// The middleware and tracker are now async (they await the shared fixed-window
// store, in-memory when no REDIS_URL is set). Each test uses its own userId so
// the per-user counter never leaks between tests.
let nextUserId = 2_000_000;
function freshUserId() {
    return nextUserId++;
}

test('rejects a request with no authenticated user', async () => {
    let error: any;

    await aiUsageLimitMiddleware({ user: undefined } as never, {} as never, ((err: any) => { error = err; }) as never);

    assert.ok(error instanceof HttpException);
    assert.equal(error.status, 401);
});

test('calls next with no error while quota remains', async () => {
    const userId = freshUserId();
    let nextCalls = 0;
    let error: any;

    await aiUsageLimitMiddleware(
        { user: { id: userId } } as never,
        {} as never,
        ((err?: any) => { nextCalls++; error = err; }) as never
    );

    assert.equal(nextCalls, 1);
    assert.equal(error, undefined);
});

test('passes a 429 HttpException to next once the daily quota is exhausted', async () => {
    const userId = freshUserId();

    for (let i = 0; i < AI_DAILY_USAGE_LIMIT; i++) {
        await AIUsageTracker.tryConsume(userId);
    }

    let error: any;
    await aiUsageLimitMiddleware({ user: { id: userId } } as never, {} as never, ((err: any) => { error = err; }) as never);

    assert.ok(error instanceof HttpException);
    assert.equal(error.status, 429);
    assert.equal(error.code, 'AI_USAGE_LIMIT_REACHED');
});
