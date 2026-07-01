import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { validateBody, validateQuery } from './validate.middleware.js';
import { HttpException } from '../utils/http-exception.js';

const schema = z.object({ email: z.string().email(), age: z.coerce.number().int() });

function makeRes() {
    return {
        statusCode: 0,
        status(code: number) { this.statusCode = code; return this; },
        json() { return this; },
    };
}

test('validateBody passes a 400 HttpException with a readable message to next on invalid input', () => {
    const mw = validateBody(schema);
    const req = { body: { email: 'not-an-email', age: 'nope' } };
    let error: any;

    mw(req as never, makeRes() as never, ((err: any) => { error = err; }) as never);

    assert.ok(error instanceof HttpException);
    assert.equal(error.status, 400);
    assert.equal(error.code, 'VALIDATION_ERROR');
    assert.match(error.message, /email/);
});

test('validateBody replaces req.body with the parsed/coerced data and calls next with no error', () => {
    const mw = validateBody(schema);
    const req = { body: { email: 'user@example.com', age: '30' } };
    let nextCalls = 0;
    let error: any;

    mw(req as never, makeRes() as never, ((err?: any) => { nextCalls++; error = err; }) as never);

    assert.equal(nextCalls, 1);
    assert.equal(error, undefined);
    assert.deepEqual(req.body, { email: 'user@example.com', age: 30 });
});

test('validateQuery passes a 400 HttpException to next on invalid query params', () => {
    const mw = validateQuery(schema);
    const req = { query: { email: 'bad', age: 'x' } };
    let error: any;

    mw(req as never, makeRes() as never, ((err: any) => { error = err; }) as never);

    assert.ok(error instanceof HttpException);
    assert.equal(error.status, 400);
});
