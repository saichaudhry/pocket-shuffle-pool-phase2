window.PoolRender = (ctx, state, pointer, power) => {
  ctx.clearRect(0,0,1000,560);
  ctx.fillStyle='#694e35';ctx.fillRect(0,0,1000,560);
  ctx.fillStyle='#254c43';ctx.fillRect(30,30,940,500);
  ctx.fillStyle='#18634f';ctx.fillRect(60,60,880,440);
  ctx.strokeStyle='#ffffff0b';ctx.lineWidth=2;ctx.strokeRect(82,82,836,396);
  for (const p of state.pockets) {
    ctx.beginPath();ctx.arc(p.x,p.y,23,0,Math.PI*2);ctx.fillStyle=p.open?'#0b1719':'#bda875';ctx.fill();
    if (!p.open) {ctx.strokeStyle='#55472f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(p.x-9,p.y-9);ctx.lineTo(p.x+9,p.y+9);ctx.moveTo(p.x+9,p.y-9);ctx.lineTo(p.x-9,p.y+9);ctx.stroke();}
  }
  const cue=state.balls[0];
  if (!PoolPhysics.moving(state.balls) && !cue.pocketed && !state.winner) {
    const angle=Math.atan2(pointer.y-cue.y,pointer.x-cue.x);
    ctx.setLineDash([7,7]);ctx.strokeStyle='#f3efd4aa';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(cue.x,cue.y);ctx.lineTo(cue.x+Math.cos(angle)*180,cue.y+Math.sin(angle)*180);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='#d8bc88';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cue.x-Math.cos(angle)*(25+power*25),cue.y-Math.sin(angle)*(25+power*25));ctx.lineTo(cue.x-Math.cos(angle)*(130+power*25),cue.y-Math.sin(angle)*(130+power*25));ctx.stroke();
  }
  for(const b of state.balls.filter(b=>!b.pocketed)) {
    ctx.save();ctx.translate(b.x,b.y);ctx.shadowColor='#0007';ctx.shadowBlur=5;ctx.shadowOffsetY=3;
    ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fillStyle=b.group==='stripe'?'#f6f3e8':b.color;ctx.fill();ctx.shadowColor='transparent';
    if(b.group==='stripe'){ctx.save();ctx.clip();ctx.fillStyle=b.color;ctx.fillRect(-12,-6,24,12);ctx.restore();}
    if(b.id){ctx.beginPath();ctx.arc(0,0,6.5,0,Math.PI*2);ctx.fillStyle='#f8f4e5';ctx.fill();ctx.fillStyle='#17201c';ctx.font='bold 8px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.id,0,.5);}
    ctx.restore();
  }
  // Phase 2: ghost cue ball while placing after a foul — green where allowed, red where not.
  if (state.placingCue && !state.winner) {
    const ok=PoolGame.canPlaceCue(state,pointer.x,pointer.y);
    ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(pointer.x,pointer.y,12,0,Math.PI*2);ctx.fillStyle='#f6f3e8';ctx.fill();
    ctx.globalAlpha=1;ctx.lineWidth=3;ctx.strokeStyle=ok?'#7be08a':'#e0605a';ctx.stroke();
  }
  // Phase 2: winner banner; shooting is also blocked in PoolGame.shoot.
  if (state.winner) {
    ctx.fillStyle='#000a';ctx.fillRect(0,220,1000,120);ctx.fillStyle='#e4d9b4';ctx.font='bold 40px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(`Player ${state.winner} wins!`,500,265);ctx.font='16px Arial';ctx.fillStyle='#a9bbb4';ctx.fillText('Press Reset table to play again',500,305);
  }
};
