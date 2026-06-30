import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpException } from './http-exception.js';

test('HttpException stores status and message', () => {
    const err = new HttpException(404, 'Not found');

    assert.equal(err.status, 404);
    assert.equal(err.message, 'Not found');
    assert.ok(err instanceof Error);
});

test('HttpException derives a default machine-readable code from the status', () => {
    assert.equal(new HttpException(400, 'bad').code, 'BAD_REQUEST');
    assert.equal(new HttpException(401, 'nope').code, 'UNAUTHORIZED');
    assert.equal(new HttpException(404, 'missing').code, 'NOT_FOUND');
    assert.equal(new HttpException(409, 'dup').code, 'CONFLICT');
    assert.equal(new HttpException(500, 'boom').code, 'INTERNAL_SERVER_ERROR');
    assert.equal(new HttpException(418, 'teapot').code, 'ERROR');
});

test('HttpException accepts an explicit code override', () => {
    const err = new HttpException(400, 'Invalid email!', 'INVALID_EMAIL');

    assert.equal(err.code, 'INVALID_EMAIL');
});

test('HttpException is marked operational', () => {
    const err = new HttpException(404, 'Not found');

    assert.equal(err.isOperational, true);
});
