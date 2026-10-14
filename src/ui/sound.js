/* Design sonore procédural : aucun fichier audio, tout est synthétisé. */
export class Sound {
  constructor() {
    this.on = false;
    this.ready = false;
    this.rev = 0;
  }

  init() {
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    this.master.connect(comp).connect(ctx.destination);

    // bus FX (clics, impacts) et bus ambiance (ducking)
    this.fx = ctx.createGain();
    this.fx.gain.value = 0.9;
    this.fx.connect(this.master);
    this.amb = ctx.createGain();
    this.amb.gain.value = 1;
    this.amb.connect(this.master);

    // moteur au ralenti : scies désaccordées dans un passe-bas résonant
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 160;
    this.filter.Q.value = 7;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.05;
    this.filter.connect(droneGain).connect(this.amb);
    this.oscs = [55, 55.35, 82.6, 27.5].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 3 ? 'sine' : 'sawtooth';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 3 ? 0.9 : 0.45;
      o.connect(g).connect(this.filter);
      o.start();
      return o;
    });
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 45;
    lfo.connect(lfoG).connect(this.filter.frequency);
    lfo.start();

    // souffle de salle
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const air = ctx.createBufferSource();
    air.buffer = this.noiseBuf;
    air.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 520;
    bp.Q.value = 0.6;
    const airG = ctx.createGain();
    airG.gain.value = 0.012;
    air.connect(bp).connect(airG).connect(this.amb);
    air.start();

    this.ready = true;
  }

  setOn(on) {
    if (on) this.init();
    if (!this.ready) return;
    this.on = on;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 1 : 0, t, on ? 0.6 : 0.15);
  }

  /** Régime moteur selon la vitesse de scroll (0..1). */
  setRev(v) {
    if (!this.on) return;
    this.rev += (v - this.rev) * 0.15;
    const t = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(160 + this.rev * 900, t, 0.08);
    this.oscs.forEach((o, i) => o.frequency.setTargetAtTime([55, 55.35, 82.6, 27.5][i] * (1 + this.rev * 0.35), t, 0.12));
  }

  duck(on) {
    if (!this.ready) return;
    this.amb.gain.setTargetAtTime(on ? 0.08 : 1, this.ctx.currentTime, 0.3);
  }

  tick(freq = 2400, vol = 0.05) {
    if (!this.on) return;
    const { ctx } = this;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g).connect(this.fx);
    o.start(t);
    o.stop(t + 0.05);
  }

  chime() {
    if (!this.on) return;
    const { ctx } = this;
    const t = ctx.currentTime;
    [659.25, 987.77, 1318.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t + i * 0.12);
      g.gain.linearRampToValueAtTime(0.07, t + i * 0.12 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 2.2);
      o.connect(g).connect(this.fx);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 2.4);
    });
  }

  boom() {
    if (!this.on) return;
    const { ctx } = this;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 1.1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g).connect(this.fx);
    o.start(t);
    o.stop(t + 1.7);
    const n = ctx.createBufferSource();
    n.buffer = this.noiseBuf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2400, t);
    lp.frequency.exponentialRampToValueAtTime(80, t + 0.8);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.25, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    n.connect(lp).connect(ng).connect(this.fx);
    n.start(t);
    n.stop(t + 1);
  }

  whoosh(dur = 0.9) {
    if (!this.on) return;
    const { ctx } = this;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = this.noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.6);
    bp.frequency.exponentialRampToValueAtTime(600, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(g).connect(this.fx);
    n.start(t);
    n.stop(t + dur + 0.05);
  }

  suspend() { if (this.ready && this.ctx.state === 'running') this.ctx.suspend(); }
  resume() { if (this.ready && this.on) this.ctx.resume(); }
}
