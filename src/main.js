import {
  gsap, ScrollTrigger, SplitText, state, $, $$, root, reduced, sound, app, store,
  countUp, shot, setSound, restoreSound, initReport, initMenu, initLinks, initPointer,
  initHUD, cinema, initReveals, initLenis, initVisibility, startStage, finaleScenes,
} from './core/app.js';

function heroFrame() {
  const portrait = innerWidth / innerHeight < 0.85;
  return portrait
    ? { zoom: 1.5, liftY: 2.1, panX: 0, focusX: 0, fade: 0.45 }
    : { zoom: 1.65, liftY: 1.6, panX: 0, focusX: 0, fade: 0.2 };
}

/* =========================================================
   Vidéo
   ========================================================= */
function initVideo() {
  const film = $('#film');
  const video = $('.film__video');
  const play = $('.film__play');
  play.addEventListener('click', () => {
    video.muted = false;
    video.controls = true;
    video.play().catch(() => {});
    film.classList.add('is-playing');
    sound.duck(true);
  });
  video.addEventListener('pause', () => sound.duck(false));
  video.addEventListener('ended', () => {
    film.classList.remove('is-playing');
    video.controls = false;
    sound.duck(false);
  });
  ScrollTrigger.create({
    trigger: film,
    start: 'top bottom',
    end: 'bottom top',
    onLeave: () => video.pause(),
    onLeaveBack: () => video.pause(),
  });
}

function buildScenes() {
  const hf = heroFrame();

  /* ---------- I · hero : sortie ---------- */
  gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  })
    .to('.hero__inner', { yPercent: -25, opacity: 0, ease: 'none' }, 0)
    .to('.scroll-cue', { opacity: 0, ease: 'none' }, 0)
    .add(shot({ zoom: hf.zoom, liftY: hf.liftY, focusX: 0, panX: 0, fade: hf.fade }, { zoom: 0.9, liftY: 0, fade: 0, ease: 'none' }), 0);

  /* ---------- II · le constat ---------- */
  const words = $('.constat__text')._words;
  const constat = gsap.timeline({
    scrollTrigger: {
      trigger: '.constat__pin',
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: 1,
    },
  });
  cinema('.constat__pin', 'top top', '+=260%');
  constat
    .to(words, { opacity: 1, stagger: 0.06, ease: 'none', duration: 2 }, 0.2)
    .add(shot({ focusX: 0, zoom: 0.9, liftY: 0, panX: 0, fade: 0 }, { focusX: -1, zoom: 0.66, panX: -2.1, fade: 0.15, duration: 1, ease: 'power2.inOut' }), 0)
    .add(shot({ speed: 0.78 }, { speed: 0.92, duration: 0.8, ease: 'power1.inOut' }), 0.2)
    .add(shot({ focusX: -1, zoom: 0.66 }, { focusX: 1, zoom: 0.58, duration: 1, ease: 'power2.inOut' }), 1.2)
    .add(shot({ fuel: 0.09, warn: 1 }, { fuel: 0.02, warn: 1, duration: 0.8, ease: 'power1.in' }), 1.4)
    .to('.constat__title', { opacity: 0.25, duration: 1 }, 1.5)
    .to({}, { duration: 0.6 });

  /* ---------- II bis · Trop tard ---------- */
  const slamSpans = $$('.slam__text span');
  gsap.set(slamSpans, { opacity: 0, scale: 1.6, filter: 'blur(16px)' });
  let slammed = false;
  gsap.timeline({
    scrollTrigger: {
      trigger: '.slam',
      start: 'top 75%',
      end: 'center center',
      scrub: 0.6,
      onUpdate: (self) => {
        if (self.progress > 0.92 && !slammed) {
          slammed = true;
          sound.boom();
          gsap.fromTo('.flash', { opacity: 0.55 }, { opacity: 0, duration: 0.9, ease: 'power2.out' });
          gsap.fromTo(state, { shake: 1, aberr: 1.2 }, { shake: 0, aberr: 0, duration: 1.1, ease: 'power3.out' });
        }
        if (self.progress < 0.5) slammed = false;
      },
    },
  })
    .to(slamSpans, { opacity: 1, scale: 1, filter: 'blur(0px)', stagger: 0.25, ease: 'power3.in' }, 0)
    .add(shot({ focusX: 1, panX: -2.1, zoom: 0.58, sat: 0.9, fade: 0.15, dials: 1, flow: 0.15 }, { focusX: 0, panX: 0, zoom: 1.5, sat: 0.15, fade: 0.1, ease: 'power2.in' }), 0);

  gsap.timeline({
    scrollTrigger: { trigger: '.slam', start: 'center center', end: 'bottom top', scrub: 1 },
  })
    .to('.slam__text', { yPercent: -30, opacity: 0, ease: 'none' }, 0)
    .add(shot({ dials: 1, sat: 0.15, flow: 0.15 }, { dials: 0, sat: 0.9, flow: 0.9, ease: 'none' }), 0);

  /* ---------- III · entre deux bilans ---------- */
  const track = $('.bilans__track');
  const dist = () => track.scrollWidth - innerWidth;
  const horiz = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.bilans__pin',
      start: 'top top',
      end: () => '+=' + dist(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
  gsap.to('.bilans__progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.bilans__pin', start: 'top top', end: () => '+=' + dist(), scrub: true },
  });
  $$('.reel').forEach((reel) => {
    gsap.from(reel.children, {
      y: 60,
      opacity: 0,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: reel, containerAnimation: horiz, start: 'left 85%', end: 'left 45%', scrub: 1 },
    });
    const c = $('[data-count]', reel);
    if (c) ScrollTrigger.create({ trigger: reel, containerAnimation: horiz, start: 'left 60%', once: true, onEnter: () => countUp(c) });
  });

  /* ---------- IV · le film ---------- */
  const film = gsap.timeline({
    scrollTrigger: {
      trigger: '.film__pin',
      start: 'top top',
      end: '+=160%',
      pin: true,
      scrub: 1,
      onEnter: () => sound.whoosh(1.1),
    },
  });
  cinema('.film__pin', 'top top', '+=160%');
  film
    .fromTo('.film__half--l', { xPercent: 0 }, { xPercent: -70, opacity: 0.12, ease: 'power2.inOut' }, 0)
    .fromTo('.film__half--r', { xPercent: 0 }, { xPercent: 70, opacity: 0.12, ease: 'power2.inOut' }, 0)
    .fromTo('.film__frame', { scale: 0.35, rotate: -8, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, ease: 'power3.inOut' }, 0)
    .fromTo('.film__aside', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 0.7)
    .add(shot({ fade: 0.1, flow: 0.9 }, { fade: 0.6, flow: 0.25, ease: 'none' }), 0);

  /* ---------- V · le point du mois ---------- */
  gsap.from('.phone', {
    rotationY: -50,
    rotationX: 20,
    y: 160,
    opacity: 0,
    duration: 1.6,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.point', start: 'top 70%', once: true },
  });
  gsap.from('.phone .qa, .phone .voice, .phone .sheet__acts', {
    x: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.5,
    scrollTrigger: { trigger: '.point', start: 'top 65%', once: true },
  });
  gsap.from('.tabs [role="tab"]', { y: 20, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.tabs', start: 'top 90%', once: true } });

  /* ---------- VI · trois temps ---------- */
  const road = $('.road__draw');
  const len = road.getTotalLength();
  gsap.set(road, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(road, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.temps__pin', start: 'top 80%', end: 'bottom 70%', scrub: 1 },
  });
  gsap.from('.tcard', {
    y: 70,
    rotationX: 18,
    opacity: 0,
    transformPerspective: 900,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.temps__cards', start: 'top 95%', end: 'top 55%', scrub: 1 },
  });

  /* ---------- VII · ADAM BOARDS : le film passe en couleur ---------- */
  const cols = $$('.adam__col');
  const adam = gsap.timeline({
    scrollTrigger: {
      trigger: '.adam__pin',
      start: 'top top',
      end: '+=240%',
      pin: true,
      scrub: 1,
      onEnter: () => sound.chime(),
    },
  });
  cinema('.adam__pin', 'top top', '+=240%');
  cols.forEach((col, i) => {
    const c = getComputedStyle(col).getPropertyValue('--c').trim();
    const b = $('b', col);
    gsap.set(b, { color: 'rgba(0,0,0,0)', webkitTextStroke: '1px rgba(236,231,225,.35)' });
    gsap.set($('.adam__disc', col), { scale: 0, rotate: -120 });
    gsap.set($('.adam__rest', col), { yPercent: 60, opacity: 0 });
    adam
      .to(b, { color: c, webkitTextStroke: '1px rgba(0,0,0,0)', ease: 'power2.out', duration: 0.6 }, i * 0.55)
      .to($('.adam__disc', col), { scale: 1, rotate: 0, ease: 'back.out(2)', duration: 0.6 }, i * 0.55 + 0.1)
      .to($('.adam__rest', col), { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.5 }, i * 0.55 + 0.2);
  });
  adam
    .fromTo('.adam__tag', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 2.2)
    .add(shot({ color: 0, fade: 0.6, flow: 0.25, particles: 1 }, { color: 1, fade: 0.35, flow: 0.5, particles: 1.4, ease: 'none', duration: 2.6 }), 0);
  gsap.from('.steps li', {
    x: -40,
    opacity: 0,
    stagger: 0.07,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.steps', start: 'top 80%', once: true },
  });

  /* ---------- VIII · le terrain ---------- */
  gsap.timeline({ scrollTrigger: { trigger: '.terrain', start: 'top bottom', end: 'top 20%', scrub: 1 } })
    .add(shot({ color: 1, particles: 1.4, fade: 0.35, flow: 0.5 }, { color: 0, particles: 0.8, fade: 0.55, flow: 0.3, ease: 'none' }), 0);
  gsap.fromTo('.terrain__img', { clipPath: 'inset(100% 0% 0% 0%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)',
    ease: 'expo.inOut',
    duration: 1.8,
    scrollTrigger: { trigger: '.terrain__portrait', start: 'top 75%', once: true },
  });
  gsap.fromTo('.terrain__img img', { yPercent: -12, scale: 1.25 }, {
    yPercent: 0,
    scale: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.terrain__portrait', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  ScrollTrigger.create({
    trigger: '.terrain__portrait',
    start: 'top 35%',
    onEnter: () => $('.terrain__img').classList.add('is-color'),
    onLeaveBack: () => $('.terrain__img').classList.remove('is-color'),
  });
  gsap.from('.career li', { y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.career', start: 'top 80%', once: true } });
  const strip = $('.strip__track');
  gsap.fromTo(strip, { x: () => innerWidth * 0.1 }, {
    x: () => -(strip.scrollWidth - innerWidth * 0.9),
    ease: 'none',
    scrollTrigger: { trigger: '.strip', start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true },
  });

  /* ---------- IX · avis ---------- */
  const quotes = $$('.avis .quote');
  gsap.set(quotes.slice(1), { opacity: 0, y: 60, filter: 'blur(10px)' });
  const avis = gsap.timeline({
    scrollTrigger: { trigger: '.avis__pin', start: 'top top', end: '+=220%', pin: true, scrub: 1 },
  });
  quotes.forEach((q, i) => {
    if (i === 0) return;
    avis
      .to(quotes[i - 1], { opacity: 0, y: -60, filter: 'blur(10px)', duration: 1 })
      .to(q, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 }, '<0.4')
      .to({}, { duration: 0.6 });
  });
  avis.add(shot({ fade: 0.55 }, { fade: 0.7, ease: 'none', duration: avis.duration() }), 0);

  /* ---------- X · la machine ---------- */
  const wires = $$('.machine__wires path');
  wires.forEach((w) => {
    const l = w.getTotalLength();
    gsap.set(w, { strokeDasharray: l, strokeDashoffset: l });
  });
  gsap.timeline({ scrollTrigger: { trigger: '.machine', start: 'top 75%', once: true } })
    .from('.machine__nodes > g', { scale: 0, opacity: 0, transformOrigin: 'center', stagger: 0.12, duration: 0.8, ease: 'back.out(2)' })
    .to(wires, { strokeDashoffset: 0, duration: 1.2, stagger: 0.1, ease: 'power2.inOut' }, 0.3)
    .from('.machine__pulses', { opacity: 0, duration: 0.6 }, '-=0.2');

  /* ---------- XI · le plein + générique ---------- */
  finaleScenes({ zoom: 1.5, fade: 0.7, flow: 0.3 });
}

/* =========================================================
   Pré-générique + intro « contact moteur »
   ========================================================= */
function runLoader(ready) {
  const loader = $('#loader');
  const num = $('.loader__num', loader);
  const crown = $('.loader__crown', loader);
  const enter = $('.loader__enter', loader);
  const seen = store.get('cador-seen') === '1';
  const prog = { v: 0 };
  const upd = () => {
    num.textContent = String(Math.round(prog.v)).padStart(3, '0');
    crown.style.setProperty('--p', `${prog.v}%`);
  };
  let isReady = false;
  ready.then(() => (isReady = true));

  return new Promise((resolve) => {
    // déjà vu dans cette session (ou arrivée depuis une autre page) : pas de barrière
    if (seen) {
      $('.loader__inner', loader).style.opacity = '0';
      ready.then(() => {
        restoreSound();
        gsap.timeline({ onComplete: () => loader.remove() })
          .to(loader, { opacity: 0, duration: 0.5, delay: 0.2 })
          .add(resolve, 0.3);
      });
      return;
    }

    const finish = () => gsap.to(prog, { v: 100, duration: 0.5, ease: 'power2.out', onUpdate: upd, onComplete: showEnter });
    gsap.to(prog, {
      v: 86,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: upd,
      onComplete: () => {
        const wait = () => (isReady ? finish() : setTimeout(wait, 60));
        wait();
      },
    });

    function showEnter() {
      enter.hidden = false;
      gsap.from(enter.children, { y: 24, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' });
      $('button', enter).focus({ preventScroll: true, focusVisible: false });
    }
    enter.addEventListener('click', (e) => {
      const b = e.target.closest('[data-enter]');
      if (!b) return;
      setSound(b.dataset.enter === 'sound');
      store.set('cador-seen', '1');
      gsap.timeline({ onComplete: () => { loader.remove(); } })
        .to(enter, { opacity: 0, duration: 0.3 })
        .to(crown, { scale: 1.6, opacity: 0, filter: 'blur(12px)', duration: 1, ease: 'power3.in' }, 0)
        .to('.loader__count, .loader__presents, .loader__hint', { opacity: 0, y: -20, duration: 0.6, stagger: 0.05 }, 0)
        .to(loader, { opacity: 0, duration: 0.5 }, 0.7)
        .add(resolve, 0.6);
    });
  });
}

function intro() {
  const bar = innerHeight / 2;
  root.style.setProperty('--bar', `${bar}px`);
  const lines = $$('[data-hero-line]');
  const splits = lines.map((l) => SplitText.create(l, { type: 'words,chars', charsClass: 'ch' }));
  gsap.set(lines, { opacity: 1 });
  const hf = heroFrame();
  // plan d'ouverture : les cadrans seuls, plein cadre ; puis recul vers le cadrage du titre
  Object.assign(state, { zoom: 0.75, liftY: 0, focusX: 0, panX: 0, backlight: 0, speed: 0, fuel: 0, warn: 0, dials: 1, fade: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(root, {
    '--bar': '0px',
    duration: 1.8,
    ease: 'expo.inOut',
    onStart: () => root.style.setProperty('--bar', `${bar}px`),
    onComplete: () => root.style.removeProperty('--bar'),
  }, 0)
    .to(state, { zoom: 1, duration: 3, ease: 'power3.out' }, 0.2)
    .to(state, { zoom: hf.zoom, liftY: hf.liftY, fade: hf.fade, duration: 2.4, ease: 'power3.inOut' }, 3.4)
    // rétro-éclairage + autotest des aiguilles, comme au contact
    .to(state, { backlight: 1, duration: 1.1, ease: 'power2.inOut', onStart: () => sound.chime() }, 0.6)
    .to(state, { speed: 1, fuel: 1, duration: 0.9, ease: 'power2.inOut' }, 1.0)
    .to(state, { speed: 0, fuel: 0, duration: 0.9, ease: 'power2.inOut' }, 1.95)
    .to(state, { speed: 0.78, duration: 2.2, ease: 'power2.out' }, 3.0)
    .to(state, { fuel: 0.09, duration: 2.6, ease: 'power1.inOut' }, 3.0)
    .to(state, { warn: 1, duration: 0.6 }, 4.6)
    .from('.hero__kicker', { opacity: 0, x: -30, duration: 1.2 }, 3.8)
    .from(splits[0].chars, { yPercent: 120, opacity: 0, filter: 'blur(14px)', rotate: 8, stagger: 0.025, duration: 1.4 }, 3.9)
    .from(splits[1].chars, { yPercent: 120, opacity: 0, filter: 'blur(14px)', rotate: 8, stagger: 0.022, duration: 1.4 }, 4.7)
    .to('.hero [data-fade]', { opacity: 1, translate: '0 0', stagger: 0.15, duration: 1.4 }, 5.3)
    .fromTo('.hud', { yPercent: -120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2 }, 5.0)
    .fromTo('.hud-bottom', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2 }, 5.2)
    .from('.scroll-cue', { opacity: 0, duration: 1.5 }, 5.8)
    .add(() => app.lenis?.start(), 4.2);
  return tl;
}

/* =========================================================
   Démarrage
   ========================================================= */
async function boot() {
  initReport();
  initMenu();
  initVideo();
  initLinks();
  initVisibility();

  const stageReady = startStage();

  if (reduced) {
    $('#loader')?.remove();
    await stageReady;
    Object.assign(state, { backlight: 1, speed: 0.78, fuel: 0.09, warn: 1, ...heroFrame(), fade: 0.35 });
    app.stage?.render(0.016);
    $$('[data-count]').forEach((el) => countUp(el));
    return;
  }

  initLenis().stop();
  window.scrollTo(0, 0);
  initPointer();

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const ready = Promise.all([stageReady, fontsReady]);
  ready.then(() => {
    initReveals();
    buildScenes();
    initHUD(360);
    ScrollTrigger.refresh();
  });

  await runLoader(ready);
  const tl = intro();
  if (import.meta.env.DEV) window.__cador = { state, lenis: app.lenis, tl, ScrollTrigger };
}

boot();
