# Pocket Shuffle Pool

**Designed by Veer Gupta**, who wrote the spec and built the Phase 1 foundation: the table, the
balls, aiming, the power bar, and physics. **Completed in Phase 2 by Sai Chaudhry**, working
from Veer's SPEC.md.

This is a 2D pool game for two players on one computer, with three solids, three stripes and
the 8-ball. Only four of the six pockets are open, and the two closed pockets change after every
second shot. See [SPEC.md](SPEC.md) for Veer's full rules. It is unchanged; my interpretations
are in a marked section at the bottom of it.

## How to run

- **Play:** download or unzip the whole project and open `index.html` in a desktop browser
  (Chrome, Firefox or Safari). No install and no server. Keep the `js` folder next to it.
- **Tests:** `node tests/run-tests.js` from the repo root (any recent Node, no `npm install`).
  14 tests cover pocketing and every match rule.

## Controls and rules in brief

- **Aim:** move the mouse; the dashed line shows the starting direction.
- **Shoot:** hold the left mouse button to charge (see the power bar), then release. The aim
  locks when you press, so you can't knock the shot off line while charging.
- **Player 1 has solids (●) and Player 2 has stripes (◐).** The highlighted box at the top shows
  whose turn it is and how many balls each player has left.
- **Pocket one of your own balls** and you shoot again. Otherwise the turn passes.
- **Closed pockets are marked with an X** and act like cushions. The text above the table shows
  how many shots remain before the pockets shuffle.
- **Scratch (cue ball pocketed):** the other player clicks anywhere on the table to place the
  cue ball. The ghost ball turns green where placement is allowed and red where it isn't.
- **To win:** clear your three balls, then sink the 8-ball. Sinking the 8-ball early, or
  together with the cue ball, loses the game.
- **Reset table** starts a fresh game at any time.

## Acceptance criteria report

Numbers follow the order of the acceptance criteria in SPEC.md. **Met** means checked by the
tests in `tests/run-tests.js` and/or headless-browser screenshots. I also ran a throwaway script
that played 300 full games with random shots and real physics (about 26,000 shots and 909
fouls). Every game ended with a winner, no ball ever left the table, and exactly four pockets
were always open.

| # | Criterion (short) | Status | Notes |
|---|---|---|---|
| 1 | Launches; table, 6 pockets, cue + 3 solids + 3 stripes + 8 | ✅ Met | Veer's work, unchanged. |
| 2 | Mouse aim + direction line | ✅ Met | Veer's work. The line is now hidden after the game ends. |
| 3 | Hold/release shooting, capped power meter | ✅ Met | Veer's work. As his README notes, even a quick click shoots with a little power (minimum speed 100). |
| 4 | Movement, cushions, collisions, friction | ✅ Met | Veer's physics. Balls that have just dropped no longer take part in collisions. |
| 5 | No shooting or cue placement while balls move | ✅ Met | Placement only becomes possible after a shot has fully stopped. |
| 6 | Exactly 4 open / 2 closed; open pockets remove balls, closed ones rebound | ✅ Met | Tested both ways. The pocket check runs before the cushion clamp, as Veer's TODO said. |
| 7 | Closed pair changes after every 2 shots (fouls included), only after balls stop, always different, 4 open | ✅ Met | Tested 50× for "different pair". **Interpretation:** "pairs" means any 2 of the 6 pockets (14 possible new pairs), not a fixed list. See the SPEC addendum. |
| 8 | P1 solids, P2 stripes; current player and groups visible | ✅ Met | Shown in the HUD boxes; the current player's box is highlighted. |
| 9 | Own ball → shoot again; otherwise turn passes; opponent balls stay down and update their count | ✅ Met | Tested. |
| 10 | Scratch ends the turn; opponent places the cue; invalid spots rejected | ✅ Met | Tested: outside the cushions, on a ball, and on a pocket are all rejected. Pocketing your own ball on the same shot doesn't save the turn. |
| 11 | 8-ball wins only if the group was cleared before the shot and no scratch; otherwise the opponent wins | ✅ Met | Eligibility is recorded when the shot starts, so clearing your last ball and the 8 on the same shot loses. Tested. |
| 12 | Winner shown, no more shots | ✅ Met | Canvas banner. `shoot()` refuses after a win, and clicks are ignored. |
| 13 | HUD: balls left per player, shots until shuffle, announces shuffle and fouls | ✅ Met | Fouls and shuffles appear in the status line ("Foul! …", "… Pockets shuffled!"). The message is replaced by "Balls moving…" or "charging" during the next shot. |
| 14 | Restart resets everything | ✅ Met | All match state lives in `PoolGame.create()`, which Veer's Reset button already calls. Tested. |
| 15 | Groups and pocket states distinguishable without color | ✅ Met | Veer's stripes, numbers and X covers. The HUD adds ● / ◐ symbols. |

**Not verified by me:** I did not play a complete game by hand with a real mouse. Everything
above was checked with tests, scripted simulation and screenshots. A quick play-through is the
next thing anyone should do.

## Code map

The scripts load in this order (keep it): `physics.js` → `game.js` → `render.js` → `main.js`.
Each one sets a global on `window`.

| File | Responsibility | Go here to change… |
|---|---|---|
| `index.html` | Page: header, status line, HUD boxes, canvas, power meter, footer. | Page layout and text |
| `style.css` | All page styling (Veer's single minified line, plus a commented HUD block I added at the end). | Look of the HUD and page |
| `js/physics.js` | `PoolPhysics`: movement, cushions, collisions, friction, and **pocket capture**. `step(balls, dt, pockets)` returns the balls pocketed during that step. | Ball behaviour, pocket size |
| `js/game.js` | `PoolGame`: starting layout and all match state (`create()`), `shoot()`, `update()`. Also `resolveShot()` (turns, fouls, 8-ball), `shufflePockets()`, `canPlaceCue()`/`placeCue()`, and HUD helpers `remaining()` and `shotsUntilShuffle()`. | Any rule |
| `js/render.js` | `PoolRender`: draws the table, pockets, aim line, balls, the ghost cue during placement, and the winner banner. Reads state only. | Visuals |
| `js/main.js` | Mouse input (aim, charge, shoot, **click to place the cue**), Reset, the fixed-step game loop, and HUD text (`updateHud()`). | Controls, on-screen text |
| `tests/run-tests.js` | Node tests. `fakeShot(state, ids)` takes a real shot and then pretends the given balls dropped, so rules can be tested without perfect physics. | Add a test per rule change |
| `prompt_log.md` | Phase 2 prompt log (Sai). | — |
| `prompt_log_phase1_veer.md` | Veer's Phase 1 prompt log, moved here unchanged. | — |
| `HANDOFF_REPORT.md` | Sai's review of inheriting the project. | — |

How a shot flows:
1. `main.js` calls `PoolGame.shoot()`. This records the shooter and whether they may sink the 8.
2. `update()` steps the physics and collects the pocketed balls in `state.shotPocketed`.
3. When everything stops, `resolveShot()` applies the rules, and the pockets shuffle on every
   second shot.
4. `main.js` displays `state.message` and the HUD.

## What I changed, and what I kept

- Veer's code is about 87% untouched: 18 of his 143 original lines were modified, almost all to
  extend them. No files were restructured or renamed.
- New code went into the spots his TODOs pointed to. Pocket entry is in `PoolPhysics.step`,
  before the cushion response. Shot resolution and the shuffle are in `PoolGame.update`. The
  cue ball stays at `balls[0]`, because `render.js` and `main.js` rely on that.
- Page text that said match rules were "coming in Phase 2" was replaced, because it was no
  longer true. The header now credits both of us.
- This README was rewritten for Phase 2. Veer's original README is in the first commit.
- Veer's `prompt_log.md` was renamed to `prompt_log_phase1_veer.md` with its contents unchanged.

## What to do next (priority order)

1. **Play-test with a real mouse**, especially cue placement and the end of the game.
2. **Keep shuffle and foul messages visible longer.** Right now they disappear as soon as the
   next shot starts charging. A small message log or a short canvas toast would help.
3. **Show the shuffle on the table:** briefly highlight the pockets that just opened or closed.

## Known bugs and traps

- **Pocket capture is "center within 23px of an open pocket"**, and only for moving balls. A
  ball rolling slowly along the rail past an open middle pocket will drop in, which is roughly
  realistic. A resting ball next to a pocket that a shuffle has just opened does not drop.
- **`balls[0]` must stay the cue ball.** `render.js`, `main.js` and `placeCue()` index it
  directly.
- **The pocketed cue ball keeps its `x`/`y` at the pocket** until it's placed. Anything new that
  reads cue coordinates should check `pocketed` first.
- **Veer's known quirks are still there:** balls can jitter briefly when crowded against a
  wall, and a quick click still shoots softly. (Moving the mouse while charging no longer changes the aim: the aim locks when you press the button.)
- **Cue placement allows any open spot** on the table (no "behind the line" rule). This is what
  the spec says, but it makes fouls costly.
