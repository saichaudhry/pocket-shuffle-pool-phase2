# Prompt log: Phase 2 (Sai Chaudhry)

**Tool:** Claude Code (CLI). **Model:** Claude Opus 5.5 (`claude-opus-5-5`).
Veer's Phase 1 log is kept unchanged in `prompt_log_phase1_veer.md`.

## My prompts (verbatim)

> https://github.com/guptaveer00/pocket-shuffle-pool/blob/main/SPEC.md now do the part two with this

> maek sure to do the whole repo clone thing it isntructs on the assignement doc i shared ealrier

Earlier in the same session I had pasted the full HW7 assignment page, so the AI was working
from those Phase 2 instructions: unmodified first commit, keep 75%, criteria report, and so on.

## What the AI did, in order

1. **Baseline:** followed the assignment's command-line method (`git clone`, `rm -rf .git`,
   `git init`, commit as "Initial commit: unmodified code as received") before opening any file.
2. **Read before changing:** SPEC.md first, then the README, Veer's prompt log, and every code
   file. It wrote a plan that followed Veer's README "What to build next" list in order.
3. **Small commits, in this order:**
   - pocketing in `physics.js`, in the spot Veer's TODO named;
   - match rules in `game.js`, filling the TODOs in `update()`;
   - HUD, cue placement and winner banner;
   - documentation.
   Tests were added with each change.
4. **Verification:** node tests, headless-Chrome screenshots of each state, and a 300-game
   random simulation with real physics.

## When the AI did something I didn't want / had to be checked

- **It tried to create the public GitHub repo with no further confirmation from me.** The
  Claude Code permission system blocked it, and publishing the repo was left to me.
- **It rewrote `js/game.js` in a single whole-file write** instead of a small targeted edit. That
  is exactly the kind of change that can quietly drop the original author's code. I checked it
  against the baseline: Veer's `create()` layout, `shoot()` and `update()` were all still there,
  with 5 of his 33 lines modified to extend them. After that, every other file was changed with
  small targeted edits only.
