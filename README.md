# Pocket Shuffle Pool

Designed by Veer Gupta, with AI assistance for the Phase 1 starter.

This is a 2D pool game for two players on the same computer. The planned twist is that two of the six pockets are blocked, and the blocked pockets change every two shots. See SPEC.md for the full rules.

## How to run

Download and unzip the whole project, then open `index.html` in a desktop browser. No installation is needed. Keep the other files and the `js` folder with it.

## Controls

- Move the mouse to aim.
- Hold the left mouse button to charge power, then release to shoot.
- Wait for the balls to stop before shooting again.
- Click **Reset table** to start over.

## What works so far

The table, eight balls, aiming line, power bar, shooting, ball collisions, wall bounces, friction, and reset work.

**Pockets do not work yet.** They are only drawings right now, so balls bounce off the edge even at an open pocket. The blocked pockets also do not change yet. Turns, fouls, and winning still need to be added.

## Spec checklist

These numbers follow the order of the acceptance criteria in SPEC.md.

1. **Partial:** table and eight balls work; a full match is unfinished.
2. **Done:** mouse aiming and direction line.
3. **Done:** hold/release shooting with a capped power bar.
4. **Done:** movement, collisions, wall bounces, and slowing to a stop.
5. **Done:** shooting is blocked while balls move. Ball placement is not available yet.
6. **Partial:** four open and two closed pockets are drawn, but balls cannot enter them.
7. **Not done:** pocket shuffle every two shots.
8. **Not done:** player assignments and current-player display.
9. **Not done:** turns and keeping your turn after scoring.
10. **Not done:** cue-ball fouls and placement.
11. **Not done:** 8-ball win/loss rules.
12. **Not done:** winner display and stopping the game afterward.
13. **Partial:** shot count and movement status display; player progress and shuffle/foul messages are missing.
14. **Partial:** reset clears the current starter; match rules will also need to reset once added.
15. **Done:** stripes, numbers, and pocket covers distinguish the ball and pocket types.

## Where the code is

- `index.html`: page and game canvas.
- `style.css`: appearance and layout.
- `js/physics.js`: ball movement, collisions, slowing, and wall bounces.
- `js/game.js`: starting layout, shooting, and counting completed shots. Add match rules here.
- `js/render.js`: draws the table, pockets, balls, and aiming line.
- `js/main.js`: mouse controls, power bar, reset button, and game loop.

Keep the scripts in their current order in `index.html`; later scripts use earlier ones.

## What to build next

1. Make open pockets remove balls. Check for pocket entry before wall bounces in `physics.js`; otherwise the wall pushes balls away first.
2. Switch the two blocked pockets every two completed shots, after all balls stop. The new pair must differ from the old pair.
3. Add player turns, assigned groups, and remaining-ball counts.
4. Add cue-ball fouls and valid placement, then 8-ball winning/losing and a game-over screen. Check whether a player was eligible for the 8-ball before the shot starts.
5. Update reset and the on-screen information for the new rules.

## Bugs and shortcuts

Physics is simplified: no spin or advanced pool rules. Balls may briefly overlap or jitter when crowded near a wall. Even a quick click shoots with a little power. Moving the mouse while charging changes your aim.

Simple drawings and separate files were used to keep the starter small and easy to continue. The balls already have a `pocketed` field, and there are TODO comments where pocketing and shot-end rules should go.

## Checks performed

The game loaded in a browser, shooting moved the balls, and reset worked. JavaScript and physics checks passed for collisions, wall bounces, stopping, and counting a shot once. The unfinished match rules have not been tested.
