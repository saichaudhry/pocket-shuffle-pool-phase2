/* Phase 2 (Sai): synthesized sound effects with the Web Audio API — no audio files.
   PoolSound.play(type, strength) where type is one of: cue, hit, pocket, foul, shuffle, win.
   strength (0..1) scales the volume of cue/hit sounds. Browsers only allow audio after a user
   gesture, so the AudioContext is created lazily on the first play() (which follows a click). */
window.PoolSound = (() => {
  let audio = null, muted = false, lastHitAt = 0;
  const minHitGapSeconds = 0.03; // a cluster can produce dozens of contacts per frame; keep it to one click

  function context() {
    if (!audio) { const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return null; audio = new Ctx(); }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  // One short tone with a fast decay: the building block for every effect.
  function tone(ac, { frequency, type = 'sine', volume = 0.2, duration = 0.12, delay = 0, slideTo = null }) {
    const start = ac.currentTime + delay, osc = ac.createOscillator(), gain = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(start); osc.stop(start + duration + 0.02);
  }

  function play(type, strength = 1) {
    if (muted) return;
    const ac = context(); if (!ac) return;
    const s = Math.max(0.15, Math.min(1, strength));
    switch (type) {
      case 'cue': tone(ac, { frequency: 180, type: 'triangle', volume: 0.25 * s, duration: 0.08 }); break;
      case 'hit':
        if (ac.currentTime - lastHitAt < minHitGapSeconds) return;
        lastHitAt = ac.currentTime;
        tone(ac, { frequency: 1400, type: 'square', volume: 0.06 * s, duration: 0.04 }); break;
      case 'pocket': tone(ac, { frequency: 220, volume: 0.3, duration: 0.25, slideTo: 90 }); break;
      case 'foul': tone(ac, { frequency: 160, type: 'sawtooth', volume: 0.12, duration: 0.35, slideTo: 80 }); break;
      case 'shuffle': [520, 660, 520, 660].forEach((f, i) => tone(ac, { frequency: f, type: 'triangle', volume: 0.1, duration: 0.09, delay: i * 0.08 })); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(ac, { frequency: f, type: 'triangle', volume: 0.15, duration: 0.3, delay: i * 0.12 })); break;
    }
  }
  return { play, isMuted: () => muted, setMuted: value => { muted = value; } };
})();
