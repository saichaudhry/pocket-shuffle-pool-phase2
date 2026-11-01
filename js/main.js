(() => {
  const canvas=document.querySelector('#table'),ctx=canvas.getContext('2d');
  const meter=document.querySelector('#power'),status=document.querySelector('#status');
  let state=PoolGame.create(),pointer={x:650,y:280},charging=false,chargeStart=0,last=performance.now(),accumulator=0;
  function locate(event){const r=canvas.getBoundingClientRect();pointer={x:(event.clientX-r.left)*canvas.width/r.width,y:(event.clientY-r.top)*canvas.height/r.height};}
  canvas.addEventListener('pointermove',locate);
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0 || PoolPhysics.moving(state.balls) || state.shotInProgress)return;
    event.preventDefault();locate(event);charging=true;chargeStart=performance.now();canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointerup',event=>{
    if(!charging)return;
    locate(event);charging=false;
    PoolGame.shoot(state,Math.atan2(pointer.y-state.balls[0].y,pointer.x-state.balls[0].x),Math.min(1,(performance.now()-chargeStart)/1200));
  });
  canvas.addEventListener('pointercancel',()=>{charging=false;});
  window.addEventListener('blur',()=>{charging=false;});
  document.querySelector('#restart').addEventListener('click',()=>{state=PoolGame.create();charging=false;accumulator=0;});
  function frame(now){
    // Small fixed steps reduce tunneling; cap elapsed time after background-tab pauses.
    accumulator+=Math.min((now-last)/1000,.05);last=now;
    while(accumulator>=1/240){PoolGame.update(state,1/240);accumulator-=1/240;}
    const power=charging?Math.min(1,(now-chargeStart)/1200):0;
    meter.value=power;status.textContent=PoolPhysics.moving(state.balls)?'Balls moving…':charging?'Charging shot…':`Ready to shoot · ${state.shots} shots completed`;
    PoolRender(ctx,state,pointer,power);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
