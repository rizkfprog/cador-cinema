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
    .add(shot({ sat: 0.15 }, { sat: 0.6, ease: 'none' }), 0);

  /* ---------- III · la chaîne : chaque maillon remplit la jauge ---------- */
  const items = $$('.chain__item');
  gsap.set(items, { opacity: 0.18, x: 30 });
  const chain = gsap.timeline({
    scrollTrigger: { trigger: '.chain__pin', start: 'top top', end: '+=' + items.length * 70 + '%', pin: true, scrub: 1 },
  });
  cinema('.chain__pin', 'top top', '+=' + items.length * 70 + '%');
  chain
    .add(shot({ focusX: 0, panX: 0, zoom: 1.5, sat: 0.6, fade: 0.1, dials: 1, flow: 0.15 }, { focusX: 1, panX: -1.9, zoom: 0.72, sat: 1, fade: 0.08, duration: 0.8, ease: 'power2.inOut' }), 0)
    .add(shot({ fuel: 0.02, warn: 1 }, { fuel: 1, warn: 0, duration: items.length, ease: 'none' }), 0.4);
  items.forEach((it, i) => {
    chain
      .to(it, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', onStart: () => sound.tick(1200 + i * 300, 0.04) }, 0.4 + i)
      .add(() => items.forEach((x, j) => x.classList.toggle('is-on', j === i)), 0.4 + i);
  });
  chain.to({}, { duration: 0.4 });

  /* ---------- IV · comment ---------- */
  gsap.timeline({ scrollTrigger: { trigger: '.how', start: 'top bottom', end: 'top 30%', scrub: 1 } })
    .add(shot({ dials: 1, fade: 0.08, flow: 0.15 }, { dials: 0, fade: 0.55, flow: 0.35, ease: 'none' }), 0);
  gsap.from('.how__steps li', { opacity: 0, y: 40, stagger: 0.15, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.how__steps', start: 'top 80%', once: true } });
  gsap.from('.phone', {
    rotationY: -50, rotationX: 20, y: 160, opacity: 0, duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: '.how', start: 'top 60%', once: true },
  });

  /* ---------- V · pourquoi lui ---------- */
  gsap.fromTo('.terrain__img', { clipPath: 'inset(100% 0% 0% 0%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)', ease: 'expo.inOut', duration: 1.8,
    scrollTrigger: { trigger: '.terrain__portrait', start: 'top 75%', once: true },
  });
  gsap.fromTo('.terrain__img img', { yPercent: -12, scale: 1.25 }, {
    yPercent: 0, scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.terrain__portrait', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  ScrollTrigger.create({
    trigger: '.terrain__portrait',
    start: 'top 35%',
    onEnter: () => $('.terrain__img').classList.add('is-color'),
    onLeaveBack: () => $('.terrain__img').classList.remove('is-color'),
  });

  /* ---------- XI · le plein + générique ---------- */
  finaleScenes({ zoom: 1.5, fade: 0.55, flow: 0.35 });
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
