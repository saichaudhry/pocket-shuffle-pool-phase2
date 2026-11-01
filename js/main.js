(() => {
  const canvas=document.querySelector('#table'),ctx=canvas.getContext('2d');
  const meter=document.querySelector('#power'),status=document.querySelector('#status');
  const hud={p1:document.querySelector('#hud-p1'),p2:document.querySelector('#hud-p2'),shuffle:document.querySelector('#shuffle-count')};
  let state=PoolGame.create(),pointer={x:650,y:280},charging=false,chargeStart=0,aimPoint=null,last=performance.now(),accumulator=0;
  // Phase 2: power sweeps 0 -> max -> 0 every 2.4s while held, so the release is a timing skill.
  const sweepMs=1200,cancelBelow=.03;
  function chargePower(now){const t=((now-chargeStart)/sweepMs)%2;return t<=1?t:2-t;}
  function locate(event){const r=canvas.getBoundingClientRect();pointer={x:(event.clientX-r.left)*canvas.width/r.width,y:(event.clientY-r.top)*canvas.height/r.height};}
  canvas.addEventListener('pointermove',locate);
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0 || PoolPhysics.moving(state.balls) || state.shotInProgress || state.winner || state.shuffleFlash>0)return;
    // After a cue-ball foul, a click places the cue ball instead of starting a shot (Phase 2).
    if(state.placingCue){locate(event);PoolGame.placeCue(state,pointer.x,pointer.y);return;}
    // Aim is locked where you pressed, so moving the mouse while charging can't change the shot (Phase 2).
    event.preventDefault();locate(event);aimPoint={...pointer};charging=true;chargeStart=performance.now();canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointerup',event=>{
    if(!charging)return;
    locate(event);charging=false;
    const power=chargePower(performance.now());
    if(power<cancelBelow)return; // released at ~zero power (or a quick click): no shot
    PoolGame.shoot(state,Math.atan2(aimPoint.y-state.balls[0].y,aimPoint.x-state.balls[0].x),power);
  });
  canvas.addEventListener('pointercancel',()=>{charging=false;});
  window.addEventListener('blur',()=>{charging=false;});
  const muteButton=document.querySelector('#mute');
  muteButton.addEventListener('click',()=>{PoolSound.setMuted(!PoolSound.isMuted());muteButton.textContent=PoolSound.isMuted()?'Sound: off':'Sound: on';muteButton.setAttribute('aria-pressed',PoolSound.isMuted());});
  document.querySelector('#restart').addEventListener('click',()=>{state=PoolGame.create();charging=false;accumulator=0;});
  function frame(now){
    // Small fixed steps reduce tunneling; cap elapsed time after background-tab pauses.
    accumulator+=Math.min((now-last)/1000,.05);last=now;
    while(accumulator>=1/240){PoolGame.update(state,1/240);accumulator-=1/240;}
    const power=charging?chargePower(now):0;
    meter.value=power;status.textContent=PoolPhysics.moving(state.balls)?'Balls moving…':charging?`Player ${state.currentPlayer} charging shot…`:state.message;
    updateHud();
    // Phase 2: play and clear the sound cues the game queued this frame.
    for(const e of state.events.splice(0))PoolSound.play(e.type,e.strength);
    PoolRender(ctx,state,charging?aimPoint:pointer,power);requestAnimationFrame(frame);
  }
  // Phase 2: per-player group + remaining balls, and shots until the next pocket shuffle.
  function updateHud(){
    for(const n of [1,2]){const g=PoolGame.groups[n],el=hud['p'+n];
      el.innerHTML=`<strong>Player ${n}</strong> · ${g==='solid'?'Solids ●':'Stripes ◐'} · ${PoolGame.remaining(state,g)} left${PoolGame.remaining(state,g)===0?' · <strong>on the 8</strong>':''}`;
      el.classList.toggle('active',!state.winner&&state.currentPlayer===n);}
    const left=PoolGame.shotsUntilShuffle(state);
    hud.shuffle.textContent=state.winner?'Game over · press Reset table to play again':`Pockets shuffle in ${left} shot${left===1?'':'s'}`;
  }
  requestAnimationFrame(frame);
})();
