import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRequestedMonth, buildMonthKey, normalizePrompt } from './month-parser.js';

// Fixed reference date so relative phrases ("last month") are deterministic.
const JUN_2026 = new Date(2026, 5, 15); // June 2026
const JAN_2026 = new Date(2026, 0, 10); // January 2026

test('resolves explicit English month names', () => {
    assert.deepEqual(resolveRequestedMonth('How much did I spend in March?', JUN_2026), { month: 3, year: 2026 });
    assert.deepEqual(resolveRequestedMonth('show me december spending', JUN_2026), { month: 12, year: 2026 });
});

test('resolves Serbian month names (nominative form)', () => {
    // The parser matches whole-word nominative names; declined forms like
    // "martu"/"marta" are intentionally out of scope.
    assert.deepEqual(resolveRequestedMonth('troskovi za mart', JUN_2026), { month: 3, year: 2026 });
    assert.deepEqual(resolveRequestedMonth('avgust troskovi', JUN_2026), { month: 8, year: 2026 });
});

test('normalizes Serbian diacritics before matching', () => {
    // "avgust" with accented characters should still match.
    assert.deepEqual(resolveRequestedMonth('ávgúst', JUN_2026), { month: 8, year: 2026 });
    assert.equal(normalizePrompt('Márt'), 'mart');
});

test('uses an explicit year when present', () => {
    assert.deepEqual(resolveRequestedMonth('spending in april 2024', JUN_2026), { month: 4, year: 2024 });
    assert.deepEqual(resolveRequestedMonth('jul 2025 expenses', JUN_2026), { month: 7, year: 2025 });
});

test('resolves "last month" relative to the reference date', () => {
    assert.deepEqual(resolveRequestedMonth('what did I spend last month', JUN_2026), { month: 5, year: 2026 });
    assert.deepEqual(resolveRequestedMonth('proslog meseca', JUN_2026), { month: 5, year: 2026 });
});

test('"last month" rolls back across the year boundary', () => {
    assert.deepEqual(resolveRequestedMonth('last month', JAN_2026), { month: 12, year: 2025 });
});

test('resolves "this month" relative to the reference date', () => {
    assert.deepEqual(resolveRequestedMonth('this month spending', JUN_2026), { month: 6, year: 2026 });
    assert.deepEqual(resolveRequestedMonth('ovaj mesec', JUN_2026), { month: 6, year: 2026 });
});

test('relative phrases take precedence over month names', () => {
    // "this month" should win even if a month name appears elsewhere.
    assert.deepEqual(resolveRequestedMonth('how does this month compare to march', JUN_2026), { month: 6, year: 2026 });
});

test('returns null when no month is referenced', () => {
    assert.equal(resolveRequestedMonth('how am I doing financially?', JUN_2026), null);
    assert.equal(resolveRequestedMonth('', JUN_2026), null);
});

test('does not match month names embedded in other words', () => {
    // word boundaries prevent "marathon" matching "mar"/"march".
    assert.equal(resolveRequestedMonth('I ran a marathon', JUN_2026), null);
});

test('buildMonthKey zero-pads the month', () => {
    assert.equal(buildMonthKey(3, 2026), '2026-03');
    assert.equal(buildMonthKey(12, 2026), '2026-12');
});
