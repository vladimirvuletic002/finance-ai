import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from './rate-limit.middleware.js';

// The limiter is now async (it awaits the shared fixed-window store). With no
// REDIS_URL set the store is in-memory, so these tests stay fast and
// deterministic; each mw call is awaited so counting order is stable.

function makeRes() {
    return {
        statusCode: 0,
        body: undefined as unknown,
        headers: {} as Record<string, string>,
        setHeader(key: string, value: string) { this.headers[key] = value; },
        status(code: number) { this.statusCode = code; return this; },
        json(payload: unknown) { this.body = payload; return this; },
    };
}

test('allows requests up to the configured max', async () => {
    const mw = rateLimit({ windowMs: 1000, max: 3 });
    const req = { ip: '1.1.1.1' };
    let nextCalls = 0;
    const next = () => { nextCalls++; };

    for (let i = 0; i < 3; i++) {
        await mw(req as never, makeRes() as never, next as never);
    }

    assert.equal(nextCalls, 3);
});

test('passes a 429 HttpException to next once the max is exceeded', async () => {
    const mw = rateLimit({ windowMs: 1000, max: 2 });
    const req = { ip: '2.2.2.2' };
    let nextCalls = 0;
    const next = () => { nextCalls++; };

    await mw(req as never, makeRes() as never, next as never);
    await mw(req as never, makeRes() as never, next as never);

    const res = makeRes();
    let error: any;
    await mw(req as never, res as never, ((err: any) => { error = err; }) as never);

    assert.equal(nextCalls, 2);
    assert.equal(res.statusCode, 0);
    assert.equal(error?.status, 429);
    assert.ok(res.headers['Retry-After'] !== undefined);
});

test('tracks each client IP independently', async () => {
    const mw = rateLimit({ windowMs: 1000, max: 1 });
    let nextCalls = 0;
    const next = () => { nextCalls++; };

    await mw({ ip: 'a' } as never, makeRes() as never, next as never);
    await mw({ ip: 'b' } as never, makeRes() as never, next as never);

    assert.equal(nextCalls, 2);
});
