import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

// auth.middleware.ts reads the JWT secret from the centralized, eagerly
// validated config module (src/config/env.ts), which is evaluated as soon
// as auth.middleware.ts is imported. Required env vars must be set BEFORE
// that import happens, so we set them here first and import the module
// under test dynamically afterwards.
const SECRET = 'test_secret';
process.env.JWT_SECRET_KEY = SECRET;
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.GEMINI_API_KEY ??= 'test-gemini-api-key';

const { default: authMiddleware } = await import('./auth.middleware.js');

function makeRes() {
    return {
        statusCode: 0,
        body: undefined as unknown,
        status(code: number) { this.statusCode = code; return this; },
        json(payload: unknown) { this.body = payload; return this; },
    };
}

test('rejects a request with no Authorization header', () => {
    const res = makeRes();
    let error: any;

    authMiddleware({ headers: {} } as never, res as never, ((err: any) => { error = err; }) as never);

    assert.equal(res.statusCode, 0);
    assert.equal(error?.status, 401);
});

test('rejects a malformed Authorization header', () => {
    const res = makeRes();
    let error: any;

    authMiddleware({ headers: { authorization: 'Bearer' } } as never, res as never, ((err: any) => { error = err; }) as never);

    assert.equal(error?.status, 401);
});

test('rejects an invalid token', () => {
    const res = makeRes();
    let error: any;

    authMiddleware({ headers: { authorization: 'Bearer not.a.jwt' } } as never, res as never, ((err: any) => { error = err; }) as never);

    assert.equal(error?.status, 401);
});

test('accepts a valid token and populates req.user', () => {
    const token = jwt.sign({ sub: 42, email: 'user@example.com' }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } } as { headers: Record<string, string>; user?: { id: number; email?: string } };
    let nextCalled = false;

    authMiddleware(req as never, makeRes() as never, (() => { nextCalled = true; }) as never);

    assert.equal(nextCalled, true);
    assert.equal(req.user?.id, 42);
    assert.equal(req.user?.email, 'user@example.com');
});
