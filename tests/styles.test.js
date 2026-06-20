import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('color pads do not use a white outline when focused, active, or pressed', () => {
  assert.doesNotMatch(css, /\.color-pad[\s\S]{0,220}outline:\s*4px\s+solid\s+var\(--ring\)/);
  assert.match(css, /\.color-pad,[\s\S]*?\.color-pad\.pressed\s*\{\s*outline:\s*0;/);
});

test('active and pressed colors pop with their own color glow instead of white border', () => {
  assert.match(css, /\.color-pad\.red\s*\{\s*--pop:\s*rgba\(239, 68, 68/);
  assert.match(css, /\.color-pad\.blue\s*\{\s*--pop:\s*rgba\(59, 130, 246/);
  assert.match(css, /\.color-pad\.green\s*\{\s*--pop:\s*rgba\(34, 197, 94/);
  assert.match(css, /\.color-pad\.yellow\s*\{\s*--pop:\s*rgba\(250, 204, 21/);
  assert.match(css, /\.color-pad\.purple\s*\{\s*--pop:\s*rgba\(168, 85, 247/);
  assert.match(css, /box-shadow:[^;]*var\(--pop\)/);
  assert.doesNotMatch(css, /0 0 28px rgba\(255, 255, 255/);
});
