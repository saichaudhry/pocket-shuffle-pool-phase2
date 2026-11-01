/* Equal-mass circles; velocities are pixels per second. No spin or sidespin. */
window.PoolPhysics = (() => {
  const bounds = { left: 60, right: 940, top: 60, bottom: 500 };
  const radius = 12;
  // Matches the 23px pocket drawn in render.js; also used to keep cue placement off pockets. (Phase 2, Sai)
  const pocketRadius = 23;
  // How close a ball's center must get to an OPEN pocket's center to drop. Middle pockets are
  // tighter, and only accept balls heading into the rail at a real angle, so a ball rolling
  // along the cushion past a middle pocket stays on the table.
  const cornerCapture = 22, middleCapture = 17;
  const middleMinApproach = 0.35; // fraction of the ball's speed that must point into the rail
  const collisionPasses = 4;      // repeated overlap resolution stops clusters jittering
  const moving = balls => balls.some(b => !b.pocketed && Math.hypot(b.vx, b.vy) > 0);
  // `pockets` and `onHit` are optional so older calls still work. Returns the balls pocketed during
  // this step. onHit(closingSpeed) is called for each ball-to-ball impact (used for sound).
  function step(balls, dt, pockets = [], onHit = null) {
    const active = balls.filter(b => !b.pocketed);
    const pocketedNow = [];
    for (const b of active) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      // Pocket check happens BEFORE the cushion clamp, otherwise the wall pushes the ball away first.
      // Only moving balls can drop: a shuffle that opens a pocket next to a resting ball must not swallow it.
      const isMoving = b.vx || b.vy;
      const pocket = isMoving && pockets.find(p => p.open && dropsInto(b, p));
      if (pocket) { b.pocketed = true; b.vx = 0; b.vy = 0; b.x = pocket.x; b.y = pocket.y; pocketedNow.push(b); continue; }
      bounceOffCushions(b);
    }
    // Balls that just dropped must not take part in collisions this step.
    const rolling = active.filter(b => !b.pocketed);
    // Several passes: pushing one pair apart can push a ball into a third ball or a cushion.
    for (let pass = 0; pass < collisionPasses; pass++) {
      for (let i = 0; i < rolling.length; i++) for (let j = i + 1; j < rolling.length; j++) {
        const a = rolling[i], b = rolling[j];
        const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
        if (distance >= radius * 2) continue;
        const nx = distance ? dx / distance : 1, ny = distance ? dy / distance : 0;
        const correction = (radius * 2 - distance) / 2;
        a.x -= nx * correction; a.y -= ny * correction;
        b.x += nx * correction; b.y += ny * correction;
        const closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (closing > 0) {
          if (onHit) onHit(closing);
          const impulse = closing * .97;
          a.vx -= impulse * nx; a.vy -= impulse * ny;
          b.vx += impulse * nx; b.vy += impulse * ny;
        }
      }
      // Collision corrections can shove a ball into a cushion; put it back inside.
      for (const b of rolling) bounceOffCushions(b);
    }
    for (const b of rolling) {
      const speed = Math.hypot(b.vx, b.vy), nextSpeed = Math.max(0, speed - 100 * dt);
      if (nextSpeed < 3) { b.vx = 0; b.vy = 0; }
      else { b.vx *= nextSpeed / speed; b.vy *= nextSpeed / speed; }
    }
    return pocketedNow;
  }
  // Veer's original cushion response, moved into a function so it can run after collisions too.
  function bounceOffCushions(b) {
    if (b.x < bounds.left + radius) { b.x = bounds.left + radius; b.vx = Math.abs(b.vx) * .92; }
    if (b.x > bounds.right - radius) { b.x = bounds.right - radius; b.vx = -Math.abs(b.vx) * .92; }
    if (b.y < bounds.top + radius) { b.y = bounds.top + radius; b.vy = Math.abs(b.vy) * .92; }
    if (b.y > bounds.bottom - radius) { b.y = bounds.bottom - radius; b.vy = -Math.abs(b.vy) * .92; }
  }
  // Pocket indexes 1 and 4 in game.js sit in the middle of the top and bottom rails (x = 500).
  function dropsInto(b, p) {
    const isMiddle = p.x !== bounds.left && p.x !== bounds.right;
    const distance = Math.hypot(b.x - p.x, b.y - p.y);
    if (!isMiddle) return distance < cornerCapture;
    if (distance >= middleCapture) return false;
    const intoRail = p.y === bounds.top ? -b.vy : b.vy; // speed toward this pocket's rail
    return intoRail >= middleMinApproach * Math.hypot(b.vx, b.vy);
  }
  return { bounds, radius, pocketRadius, moving, step };
})();
