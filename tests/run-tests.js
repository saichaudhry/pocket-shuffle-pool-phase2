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

// Takes a real shot via PoolGame.shoot (so turn/eligibility bookkeeping runs), then pretends the
// balls in `droppedIds` fell in, stops everything, and lets update() resolve the shot.
function fakeShot(state, droppedIds) {
  state.shuffleFlash = 0; // skip the 1.5s shuffle highlight between test shots
  const ok = PoolGame.shoot(state, 0, 0.1);
  if (!ok) throw new Error('shot was refused');
  for (const b of state.balls) { b.vx = 0; b.vy = 0; }
  for (const id of droppedIds) { const b = ball(state, id); b.pocketed = true; state.shotPocketed.push(b); }
  PoolGame.update(state, 1 / 240);
}
const openCount = state => state.pockets.filter(p => p.open).length;

test('missing passes the turn; pocketing your own ball keeps it', () => {
  const state = PoolGame.create();
  eq(state.currentPlayer, 1);
  fakeShot(state, [1]);          // P1 sinks solid 1
  eq(state.currentPlayer, 1);
  fakeShot(state, []);           // P1 misses
  eq(state.currentPlayer, 2);
});

test('pocketing only an opponent ball passes the turn and lowers their count', () => {
  const state = PoolGame.create();
  fakeShot(state, [9]);          // P1 sinks a stripe
  eq(state.currentPlayer, 2);
  eq(PoolGame.remaining(state, 'stripe'), 2);
});

test('shuffle happens every 2 shots, changes the pair, keeps 4 open', () => {
  for (let trial = 0; trial < 50; trial++) {
    const state = PoolGame.create();
    fakeShot(state, []);
    eq(state.closedPair, [1, 4], 'no shuffle after 1 shot');
    eq(PoolGame.shotsUntilShuffle(state), 1);
    const before = state.closedPair.join();
    fakeShot(state, []);
    if (state.closedPair.join() === before) throw new Error('pair did not change');
    eq(openCount(state), 4);
    eq(PoolGame.shotsUntilShuffle(state), 2);
  }
});

test('fouls count toward the shuffle', () => {
  const state = PoolGame.create();
  fakeShot(state, [0]);                        // foul
  PoolGame.placeCue(state, 300, 300);
  fakeShot(state, []);
  eq(state.shots, 2);
  if (state.closedPair.join() === '1,4') throw new Error('no shuffle after a foul + a shot');
});

test('cue-ball foul: turn passes and opponent must place the cue before shooting', () => {
  const state = PoolGame.create();
  fakeShot(state, [0, 1]);                     // P1 scratches while sinking own ball
  eq(state.currentPlayer, 2);
  eq(state.placingCue, true);
  eq(ball(state, 1).pocketed, true, 'other balls stay pocketed');
  eq(PoolGame.shoot(state, 0, 0.5), false, 'cannot shoot before placing');
  eq(PoolGame.placeCue(state, 30, 30), false, 'outside the cushions');
  eq(PoolGame.placeCue(state, 675, 267), false, 'on top of a ball');
  eq(PoolGame.placeCue(state, 80, 80), false, 'on a pocket');
  eq(PoolGame.placeCue(state, 300, 300), true);
  eq(state.placingCue, false);
});

test('8-ball after clearing your group wins', () => {
  const state = PoolGame.create();
  for (const id of [1, 2, 3]) ball(state, id).pocketed = true;
  fakeShot(state, [8]);
  eq(state.winner, 1);
});

test('early 8-ball loses', () => {
  const state = PoolGame.create();
  fakeShot(state, [8]);
  eq(state.winner, 2);
});

test('clearing your last ball AND the 8 on the same shot loses (eligibility is checked before the shot)', () => {
  const state = PoolGame.create();
  for (const id of [1, 2]) ball(state, id).pocketed = true;
  fakeShot(state, [3, 8]);
  eq(state.winner, 2);
});

test('8-ball with the cue ball loses even when eligible', () => {
  const state = PoolGame.create();
  for (const id of [1, 2, 3]) ball(state, id).pocketed = true;
  fakeShot(state, [8, 0]);
  eq(state.winner, 2);
});

test('no shots after the game ends', () => {
  const state = PoolGame.create();
  fakeShot(state, [8]);
  eq(PoolGame.shoot(state, 0, 0.5), false);
});

test('reset (create) gives a fresh game', () => {
  const state = PoolGame.create();
  eq([state.currentPlayer, state.shots, state.winner, state.placingCue, openCount(state)], [1, 0, 0, false, 4]);
});

test('a shuffle highlights the changed pockets and blocks shooting until it ends', () => {
  const state = PoolGame.create();
  fakeShot(state, []);
  fakeShot(state, []);                                  // 2nd shot -> shuffle
  if (state.changedPockets.length < 2 || state.changedPockets.length > 4) throw new Error('changed: ' + state.changedPockets);
  eq(PoolGame.shoot(state, 0, 0.5), false, 'blocked during highlight');
  for (let i = 0; i < 240 * 2; i++) PoolGame.update(state, 1 / 240);
  eq(state.shuffleFlash, 0);
  eq(PoolGame.shoot(state, 0, 0.5), true, 'allowed after highlight');
});

// ---- add new tests above this line ----
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
