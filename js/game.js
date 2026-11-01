window.PoolGame = (() => {
  const colors = ['#edbd49', '#5a92db', '#dd6665'];
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
      shotPocketed: [] // balls that dropped during the current shot (Phase 2)
    };
  }
  function shoot(state, angle, power) {
    if (PoolPhysics.moving(state.balls) || state.shotInProgress) return false;
    const cue = state.balls.find(b => b.group === 'cue');
    if (!cue || cue.pocketed) return false;
    const speed = 100 + Math.max(0, Math.min(1, power)) * 750;
    cue.vx = Math.cos(angle) * speed; cue.vy = Math.sin(angle) * speed;
    state.shotInProgress = true;
    state.shotPocketed = [];
    return true;
  }
  function update(state, dt) {
    state.shotPocketed.push(...PoolPhysics.step(state.balls, dt, state.pockets));
    if (state.shotInProgress && !PoolPhysics.moving(state.balls)) {
      state.shotInProgress = false; state.shots++;
      // TODO (Sai): resolve shot pocket events, fouls, turns, and winner here.
      // TODO (Sai): after every second completed shot, choose a different closed-pocket pair.
    }
  }
  return { create, shoot, update };
})();
