// Rules/physics tests (added in Phase 2). Run from the repo root:  node tests/run-tests.js
// The game files attach themselves to `window`, so point `window` at Node's global first.
globalThis.window = globalThis;
require('../js/physics.js');
require('../js/game.js');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; } catch (e) { failed++; console.log(`FAIL: ${name}\n   ${e.message}`); }
}
function eq(actual, expected, label = '') {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label} expected ${e}, got ${a}`);
}
// Runs the simulation until every ball has stopped (same 1/240s step as main.js).
function settle(state) {
  for (let i = 0; i < 240 * 30 && (state.shotInProgress || PoolPhysics.moving(state.balls)); i++) PoolGame.update(state, 1 / 240);
}
// Moves every object ball except `keepIds` off the table so a test controls exactly what is in play.
function clearTableExcept(state, keepIds) {
  for (const b of state.balls) if (b.id !== 0 && !keepIds.includes(b.id)) b.pocketed = true;
}
const ball = (state, id) => state.balls.find(b => b.id === id);
const shootAt = (state, x, y, power = 0.6) => {
  const cue = state.balls[0];
  return PoolGame.shoot(state, Math.atan2(y - cue.y, x - cue.x), power);
};

test('a ball rolling into an OPEN corner pocket is pocketed', () => {
  const state = PoolGame.create();
  clearTableExcept(state, []);
  const cue = state.balls[0]; cue.x = 200; cue.y = 200;
  shootAt(state, 60, 60, 0.5);
  settle(state);
  eq(cue.pocketed, true);
});

test('a ball rolling into a CLOSED pocket rebounds and stays in play', () => {
  const state = PoolGame.create();
  clearTableExcept(state, []);
  const cue = state.balls[0]; cue.x = 500; cue.y = 300;
  eq(state.pockets[1].open, false, 'top-middle pocket starts closed');
  shootAt(state, 500, 60, 0.5);
  settle(state);
  eq(cue.pocketed, false);
});

test('a resting ball next to a pocket is not swallowed', () => {
  const state = PoolGame.create();
  const cue = state.balls[0]; cue.x = 75; cue.y = 75;
  for (let i = 0; i < 100; i++) PoolGame.update(state, 1 / 240);
  eq(cue.pocketed, false);
});

// ---- add new tests above this line ----
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
