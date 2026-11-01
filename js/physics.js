/* Equal-mass circles; velocities are pixels per second. No spin or sidespin. */
window.PoolPhysics = (() => {
  const bounds = { left: 60, right: 940, top: 60, bottom: 500 };
  const radius = 12;
  const moving = balls => balls.some(b => !b.pocketed && Math.hypot(b.vx, b.vy) > 0);
  function step(balls, dt) {
    const active = balls.filter(b => !b.pocketed);
    for (const b of active) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < bounds.left + radius) { b.x = bounds.left + radius; b.vx = Math.abs(b.vx) * .92; }
      if (b.x > bounds.right - radius) { b.x = bounds.right - radius; b.vx = -Math.abs(b.vx) * .92; }
      if (b.y < bounds.top + radius) { b.y = bounds.top + radius; b.vy = Math.abs(b.vy) * .92; }
      if (b.y > bounds.bottom - radius) { b.y = bounds.bottom - radius; b.vy = -Math.abs(b.vy) * .92; }
    }
    for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
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
    for (const b of active) {
      const speed = Math.hypot(b.vx, b.vy), nextSpeed = Math.max(0, speed - 100 * dt);
      if (nextSpeed < 3) { b.vx = 0; b.vy = 0; }
      else { b.vx *= nextSpeed / speed; b.vy *= nextSpeed / speed; }
    }
  }
  // TODO (Sai): detect open-pocket entry BEFORE cushion response; closed pockets retain cushion behavior.
  return { bounds, radius, moving, step };
})();
