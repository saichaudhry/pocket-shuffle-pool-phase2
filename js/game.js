window.PoolGame = (() => {
  const colors = ['#edbd49', '#5a92db', '#dd6665'];
  // Phase 2 (Sai): match-rule constants. Player 1 = solids, Player 2 = stripes (SPEC rule 2).
  const groups = { 1: 'solid', 2: 'stripe' };
  const shotsPerShuffle = 2;
  // Every way to choose 2 of the 6 pockets (15 pairs). SPEC rule 6 says "pairs other than the
  // current pair"; we read that as any 2 pockets, not a fixed list. See README.
  const pocketPairs = [];
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) pocketPairs.push([i, j]);

  function create() {
    const ball = (id, group, x, y, color) => ({ id, group, x, y, color, vx: 0, vy: 0, pocketed: false });
    return {
      balls: [ball(0, 'cue', 270, 280, '#f6f3e8'),
        ball(1, 'solid', 650, 280, colors[0]), ball(9, 'stripe', 675, 267, colors[0]),
        ball(8, 'eight', 675, 293, '#202b31'), ball(2, 'solid', 700, 254, colors[1]),
        ball(10, 'stripe', 700, 280, colors[1]), ball(3, 'solid', 700, 306, colors[2]),
        ball(11, 'stripe', 725, 267, colors[2])],
      pockets: [[60,60],[500,60],[940,60],[60,500],[500,500],[940,500]].map(([x,y],i) => ({ x, y, open: i !== 1 && i !== 4 })),
      shots: 0, shotInProgress: false,
      shotPocketed: [], // balls that dropped during the current shot (Phase 2)
      // ---- Phase 2 match state. Everything lives here so Reset (create()) clears it all. ----
      closedPair: [1, 4],        // indexes into pockets; matches the `open` flags above
      currentPlayer: 1,          // 1 or 2; Player 1 breaks (SPEC rule 1)
      shooter: 1,                // who took the shot in progress
      eligibleForEight: false,   // shooter had cleared their group when the shot began (rule 7)
      placingCue: false,         // true after a cue-ball foul until the incoming player places it
      winner: 0,                 // 0 = game running, else 1 or 2
      message: 'Player 1 breaks. Solids vs stripes.'
    };
  }

  // Balls of `group` still on the table.
  function remaining(state, group) {
    return state.balls.filter(b => b.group === group && !b.pocketed).length;
  }
  function shotsUntilShuffle(state) {
    return shotsPerShuffle - (state.shots % shotsPerShuffle);
  }

  function shoot(state, angle, power) {
    if (PoolPhysics.moving(state.balls) || state.shotInProgress) return false;
    if (state.winner || state.placingCue) return false; // game over, or cue must be placed first
    const cue = state.balls.find(b => b.group === 'cue');
    if (!cue || cue.pocketed) return false;
    const speed = 100 + Math.max(0, Math.min(1, power)) * 750;
    cue.vx = Math.cos(angle) * speed; cue.vy = Math.sin(angle) * speed;
    state.shotInProgress = true;
    state.shotPocketed = [];
    state.shooter = state.currentPlayer;
    // Decided at the START of the shot: clearing your last ball and the 8 together still loses.
    state.eligibleForEight = remaining(state, groups[state.shooter]) === 0;
    return true;
  }

  function update(state, dt) {
    state.shotPocketed.push(...PoolPhysics.step(state.balls, dt, state.pockets));
    if (state.shotInProgress && !PoolPhysics.moving(state.balls)) {
      state.shotInProgress = false; state.shots++;
      resolveShot(state);
      if (!state.winner && state.shots % shotsPerShuffle === 0) shufflePockets(state);
    }
  }

  // Applies SPEC rules 3, 4, 7, 8 and 9 once all balls have stopped.
  function resolveShot(state) {
    const shooter = state.shooter, opponent = 3 - shooter;
    const dropped = state.shotPocketed;
    const cueIn = dropped.some(b => b.group === 'cue');
    const eightIn = dropped.some(b => b.group === 'eight');
    const ownIn = dropped.some(b => b.group === groups[shooter]);
    if (eightIn) {
      const legal = state.eligibleForEight && !cueIn;
      state.winner = legal ? shooter : opponent;
      state.message = legal ? `Player ${shooter} sinks the 8-ball and wins!`
        : `Player ${shooter} ${cueIn ? 'scratched on the 8-ball' : 'sank the 8-ball too early'}. Player ${opponent} wins!`;
      return;
    }
    if (cueIn) {
      state.currentPlayer = opponent;
      state.placingCue = true;
      state.message = `Foul! Cue ball pocketed. Player ${opponent}: click the table to place the cue ball.`;
      return;
    }
    if (ownIn) {
      state.message = `Player ${shooter} pocketed a ball and shoots again.`;
    } else {
      state.currentPlayer = opponent;
      state.message = `Player ${opponent}'s turn.`;
    }
  }

  // SPEC rule 6: pick a different closed pair at random; exactly four pockets stay open.
  function shufflePockets(state) {
    const same = ([a, b]) => a === state.closedPair[0] && b === state.closedPair[1];
    const choices = pocketPairs.filter(pair => !same(pair));
    state.closedPair = choices[Math.floor(Math.random() * choices.length)];
    state.pockets.forEach((p, i) => { p.open = !state.closedPair.includes(i); });
    state.message += ' Pockets shuffled!';
  }

  // Can the cue ball go at (x, y)? Inside the cushions, not touching any ball or any pocket (rule 9).
  function canPlaceCue(state, x, y) {
    const { bounds, radius, pocketRadius } = PoolPhysics;
    if (x < bounds.left + radius || x > bounds.right - radius || y < bounds.top + radius || y > bounds.bottom - radius) return false;
    if (state.balls.some(b => b.group !== 'cue' && !b.pocketed && Math.hypot(b.x - x, b.y - y) < radius * 2)) return false;
    return !state.pockets.some(p => Math.hypot(p.x - x, p.y - y) < pocketRadius + radius);
  }
  function placeCue(state, x, y) {
    if (!state.placingCue || !canPlaceCue(state, x, y)) return false;
    const cue = state.balls[0];
    Object.assign(cue, { x, y, vx: 0, vy: 0, pocketed: false });
    state.placingCue = false;
    state.message = `Player ${state.currentPlayer}: cue ball placed. Take your shot.`;
    return true;
  }

  return { create, shoot, update, groups, remaining, shotsUntilShuffle, canPlaceCue, placeCue };
})();
