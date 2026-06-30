import { test } from 'node:test';
import assert from 'node:assert/strict';

// error.middleware.ts imports the centralized config module (src/config/env.ts),
// which validates process.env as soon as it is imported. Set the required env
// vars first, then import the module under test dynamically so config picks
// them up without crashing the test process.
process.env.JWT_SECRET_KEY ??= 'test_secret_key_long_enough';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.GEMINI_API_KEY ??= 'test-gemini-api-key';

const { errorMiddleware, formatErrorResponse } = await import('./error.middleware.js');
const { HttpException } = await import('../utils/http-exception.js');

function makeRes() {
    return {
        statusCode: 0,
        body: undefined as unknown,
        status(code: number) { this.statusCode = code; return this; },
        json(payload: unknown) { this.body = payload; return this; },
    };
}

test('formats HttpException into the standardized { error: { message, code } } shape', () => {
    const res = makeRes();
    const err = new HttpException(404, 'Transaction not found!');

    errorMiddleware(err, {} as never, res as never, (() => {}) as never);

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
        error: { message: 'Transaction not found!', code: 'NOT_FOUND' },
    });
});

test('preserves a custom HttpException code when provided', () => {
    const res = makeRes();
    const err = new HttpException(409, 'User with that email already exists!', 'EMAIL_TAKEN');

    errorMiddleware(err, {} as never, res as never, (() => {}) as never);

    assert.equal(res.statusCode, 409);
    assert.deepEqual(res.body, {
        error: { message: 'User with that email already exists!', code: 'EMAIL_TAKEN' },
    });
});

test('formatErrorResponse hides the real message of unexpected errors in production', () => {
    const err = new Error('Sensitive internal detail (e.g. a SQL error)');

    const result = formatErrorResponse(err, true);

    assert.equal(result.status, 500);
    assert.deepEqual(result.body, {
        error: { message: 'Internal Server Error', code: 'INTERNAL_SERVER_ERROR' },
    });
});

test('formatErrorResponse includes the real message of unexpected errors outside production', () => {
    const err = new Error('helpful debug detail');

    const result = formatErrorResponse(err, false);

    assert.equal(result.status, 500);
    assert.deepEqual(result.body, {
        error: { message: 'helpful debug detail', code: 'INTERNAL_SERVER_ERROR' },
    });
});

test('formatErrorResponse always preserves an HttpException message, even in production', () => {
    const err = new HttpException(400, 'Invalid category!');

    const result = formatErrorResponse(err, true);

    assert.deepEqual(result.body, {
        error: { message: 'Invalid category!', code: 'BAD_REQUEST' },
    });
});
