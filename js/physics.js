/* Equal-mass circles; velocities are pixels per second. No spin or sidespin. */
window.PoolPhysics = (() => {
  const bounds = { left: 60, right: 940, top: 60, bottom: 500 };
  const radius = 12;
  // Matches the 23px pocket drawn in render.js. A ball's center must come within this distance
  // of an OPEN pocket's center to drop. (Phase 2, Sai)
  const pocketRadius = 23;
  const moving = balls => balls.some(b => !b.pocketed && Math.hypot(b.vx, b.vy) > 0);
  // `pockets` is optional so older calls still work. Returns the balls pocketed during this step.
  function step(balls, dt, pockets = []) {
    const active = balls.filter(b => !b.pocketed);
    const pocketedNow = [];
    for (const b of active) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      // Pocket check happens BEFORE the cushion clamp, otherwise the wall pushes the ball away first.
      // Only moving balls can drop: a shuffle that opens a pocket next to a resting ball must not swallow it.
      const isMoving = b.vx || b.vy;
      const pocket = isMoving && pockets.find(p => p.open && Math.hypot(b.x - p.x, b.y - p.y) < pocketRadius);
      if (pocket) { b.pocketed = true; b.vx = 0; b.vy = 0; b.x = pocket.x; b.y = pocket.y; pocketedNow.push(b); continue; }
      if (b.x < bounds.left + radius) { b.x = bounds.left + radius; b.vx = Math.abs(b.vx) * .92; }
      if (b.x > bounds.right - radius) { b.x = bounds.right - radius; b.vx = -Math.abs(b.vx) * .92; }
      if (b.y < bounds.top + radius) { b.y = bounds.top + radius; b.vy = Math.abs(b.vy) * .92; }
      if (b.y > bounds.bottom - radius) { b.y = bounds.bottom - radius; b.vy = -Math.abs(b.vy) * .92; }
    }
    // Balls that just dropped must not take part in collisions this step.
    const rolling = active.filter(b => !b.pocketed);
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
        const impulse = closing * .97;
        a.vx -= impulse * nx; a.vy -= impulse * ny;
        b.vx += impulse * nx; b.vy += impulse * ny;
      }
    }
    for (const b of rolling) {
      const speed = Math.hypot(b.vx, b.vy), nextSpeed = Math.max(0, speed - 100 * dt);
      if (nextSpeed < 3) { b.vx = 0; b.vy = 0; }
      else { b.vx *= nextSpeed / speed; b.vy *= nextSpeed / speed; }
    }
    return pocketedNow;
  }
  return { bounds, radius, pocketRadius, moving, step };
})();
