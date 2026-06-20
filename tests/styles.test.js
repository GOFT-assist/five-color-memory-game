import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

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

test('pressed colors animate back down even if the pressed class lingers briefly', () => {
  assert.match(css, /\.color-pad\.pressed\s*\{\s*animation:\s*press-pop-reset 180ms ease-out both;/);
  assert.match(css, /@keyframes press-pop-reset/);
  assert.match(css, /100%\s*\{[\s\S]*?transform:\s*translateY\(0\) scale\(1\);/);
  assert.match(css, /appearance:\s*none;/);
  assert.match(css, /-webkit-tap-highlight-color:\s*transparent;/);
});

test('button press logic restarts and clears the pressed state every tap', () => {
  assert.match(app, /function resetColorPads\(\) \{[\s\S]*?classList\.remove\('active', 'pressed'\);[\s\S]*?pad\.blur\(\);[\s\S]*?\}/);
  assert.match(app, /resetColorPads\(\);\s*\n\s*button\.classList\.remove\('pressed'\);\s*\n\s*void button\.offsetWidth;\s*\n\s*button\.classList\.add\('pressed'\);/);
  assert.match(app, /button\.addEventListener\('animationend', resetColorPads, \{ once: true \}\);/);
  assert.match(app, /window\.setTimeout\(resetColorPads, 220\);/);
  assert.match(app, /await wait\(SHOW_DELAY_MS\);\s*\n\s*resetColorPads\(\);/);
});
