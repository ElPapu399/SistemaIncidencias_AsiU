import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPriorityWeight,
  comparePriorities,
  compareDates,
  compareStrings,
  compareNumbers,
  getNextDirection,
} from '../src/utils/tableSorting.ts';

test('tableSorting - getPriorityWeight', () => {
  assert.equal(getPriorityWeight('Alta'), 3);
  assert.equal(getPriorityWeight('alta'), 3);
  assert.equal(getPriorityWeight('Media'), 2);
  assert.equal(getPriorityWeight('Baja'), 1);
  assert.equal(getPriorityWeight(null), 0);
  assert.equal(getPriorityWeight(undefined), 0);
  assert.equal(getPriorityWeight('desconocido'), 0);
});

test('tableSorting - comparePriorities', () => {
  // Descending: Alta should come before Baja (negative comparator output means A before B)
  assert.ok(comparePriorities('Alta', 'Baja', 'desc') < 0);
  assert.ok(comparePriorities('Baja', 'Alta', 'desc') > 0);
  assert.equal(comparePriorities('Media', 'Media', 'desc'), 0);

  // Ascending: Baja should come before Alta
  assert.ok(comparePriorities('Baja', 'Alta', 'asc') < 0);
  assert.ok(comparePriorities('Alta', 'Baja', 'asc') > 0);
});

test('tableSorting - compareDates', () => {
  const d1 = '2026-01-01T10:00:00Z';
  const d2 = '2026-02-01T10:00:00Z';

  // Descending: newest (d2) comes before oldest (d1)
  assert.ok(compareDates(d2, d1, 'desc') < 0);
  assert.ok(compareDates(d1, d2, 'desc') > 0);

  // Ascending: oldest (d1) comes before newest (d2)
  assert.ok(compareDates(d1, d2, 'asc') < 0);
  assert.ok(compareDates(d2, d1, 'asc') > 0);
});

test('tableSorting - compareStrings with natural numeric sorting', () => {
  assert.ok(compareStrings('Ticket #2', 'Ticket #10', 'asc') < 0);
  assert.ok(compareStrings('Ticket #10', 'Ticket #2', 'desc') < 0);
});

test('tableSorting - compareNumbers', () => {
  assert.ok(compareNumbers(1, 10, 'asc') < 0);
  assert.ok(compareNumbers(10, 1, 'desc') < 0);
});

test('tableSorting - getNextDirection', () => {
  assert.equal(getNextDirection('date', 'priority', 'desc', 'desc'), 'desc');
  assert.equal(getNextDirection('priority', 'priority', 'desc', 'desc'), 'asc');
  assert.equal(getNextDirection('priority', 'priority', 'asc', 'desc'), 'desc');
});
