import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLORS,
  createGameState,
  extendSequence,
  getRandomColorId,
  markReadyForInput,
  registerInput,
  startGame,
} from '../src/game.js';

test('game uses exactly five colors', () => {
  assert.equal(COLORS.length, 5);
  assert.deepEqual(COLORS.map((color) => color.id), ['red', 'blue', 'green', 'yellow', 'purple']);
});

test('random color selection stays inside allowed colors', () => {
  assert.equal(getRandomColorId(() => 0), 'red');
  assert.equal(getRandomColorId(() => 0.21), 'blue');
  assert.equal(getRandomColorId(() => 0.44), 'green');
  assert.equal(getRandomColorId(() => 0.68), 'yellow');
  assert.equal(getRandomColorId(() => 0.99), 'purple');
});

test('starting a game creates a single-color sequence and preserves best level', () => {
  const state = startGame(() => 0.99, 4);
  assert.equal(state.status, 'showing');
  assert.equal(state.bestLevel, 4);
  assert.deepEqual(state.sequence, ['purple']);
});

test('markReadyForInput only changes showing games', () => {
  const idle = createGameState(2);
  assert.equal(markReadyForInput(idle), idle);

  const ready = markReadyForInput({ ...idle, status: 'showing', sequence: ['red'] });
  assert.equal(ready.status, 'input');
  assert.deepEqual(ready.input, []);
});

test('correct full sequence advances level, score, best, and extends pattern', () => {
  let state = startGame(() => 0, 0);
  state = markReadyForInput(state);
  const next = registerInput(state, 'red', () => 0.99);

  assert.equal(next.status, 'showing');
  assert.equal(next.level, 2);
  assert.equal(next.score, 10);
  assert.equal(next.bestLevel, 1);
  assert.deepEqual(next.sequence, ['red', 'purple']);
});

test('wrong input ends the game and records best completed level', () => {
  const state = {
    ...createGameState(0),
    level: 3,
    sequence: ['red', 'blue', 'green'],
    input: ['red'],
    status: 'input',
  };
  const next = registerInput(state, 'green');

  assert.equal(next.status, 'lost');
  assert.equal(next.bestLevel, 2);
  assert.match(next.message, /Oops/);
});

test('partial correct input keeps accepting player taps', () => {
  const state = {
    ...createGameState(0),
    level: 2,
    sequence: ['red', 'blue'],
    status: 'input',
  };
  const next = registerInput(state, 'red');

  assert.equal(next.status, 'input');
  assert.deepEqual(next.input, ['red']);
  assert.match(next.message, /1 more/);
});

test('extendSequence does not mutate the original sequence', () => {
  const original = ['red'];
  const next = extendSequence(original, () => 0.44);
  assert.deepEqual(original, ['red']);
  assert.deepEqual(next, ['red', 'green']);
});
