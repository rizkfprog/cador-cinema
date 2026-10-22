import './styles/pages.css';
import {
  gsap, ScrollTrigger, SplitText, state, $, $$, root, reduced, sound, app,
  countUp, shot, restoreSound, initReport, initMenu, initLinks, initPointer,
  initHUD, cinema, initReveals, initLenis, initVisibility, startStage, finaleScenes, openShutter,
} from './core/app.js';

const body = document.body;
const scene = body.dataset.scene || 'gold';
const runtime = +body.dataset.runtime || 240;

const SCENES = {
  gold: { color: 0, flow: 0.2, particles: 1 },
  adam: { color: 1, flow: 0.35, particles: 1.3 },
  flow: { color: 0, flow: 1.1, particles: 1.2 },
};
const base = SCENES[scene] || SCENES.gold;

/* =========================================================
   Intro de page : les volets s'ouvrent, le titre se compose
   ========================================================= */
function heroIntro() {
  clearTimeout(window.__barT);
  openShutter(150);
  const title = $('[data-hero-title]');
  const split = SplitText.create(title, { type: 'lines,words', mask: 'lines', linesClass: 'line' });
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.35 });
  tl.from('.crumbs, .phero__kicker', { opacity: 0, y: 20, stagger: 0.1, duration: 1 }, 0)
    .from(split.words, { yPercent: 115, rotate: 5, filter: 'blur(10px)', stagger: 0.035, duration: 1.4 }, 0.15)
    .to('.phero [data-hero-fade]', { opacity: 1, translate: '0 0', stagger: 0.15, duration: 1.3 }, 0.7)
    .from('.slate li', { opacity: 0, y: 14, stagger: 0.07, duration: 0.9 }, 0.95)
    .fromTo('.phero__frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut' }, 0.1)
    .fromTo('.phero__frame img', { scale: 1.35 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0.2)
    .add(() => $('.phero__frame')?.classList.add('is-color'), 1.6)
    .from('.phero__still figcaption', { opacity: 0, x: -20, duration: 1 }, 1.4)
    .fromTo('.hud', { yPercent: -120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1 }, 0.4)
    .fromTo('.hud-bottom', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1 }, 0.6);
  if (app.stage) tl.fromTo(state, { backlight: 0, particles: 0 }, { backlight: 1, particles: base.particles, duration: 2, ease: 'power2.out' }, 0);
  return tl;
}

/* =========================================================
   Composants
   ========================================================= */
function heroScroll() {
  gsap.to('.phero__frame img', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.phero__copy', {
    yPercent: -12,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: '.phero', start: 'center top', end: 'bottom top', scrub: true },
  });
}

function chapters() {
  $$('.chap__num').forEach((n) => {
    gsap.from(n, { opacity: 0, x: -30, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 85%', once: true } });
  });

  $$('.timeline').forEach((tl) => {
    gsap.fromTo(tl, { '--line': 0 }, { '--line': 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 75%', end: 'bottom 60%', scrub: true } });
    $$('li', tl).forEach((li) => {
      gsap.from(li, { opacity: 0, x: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 82%', once: true, onEnter: () => sound.tick(1600, 0.03) } });
    });
  });

  $$('.works li, .six li, .dossier li, .formats li, .cards .card, .pager__item, .verb').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 50, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  $$('.ledger').forEach((t) => {
    gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 80%', once: true } })
      .from($$('caption, thead tr', t), { opacity: 0, y: 10, duration: 0.6 })
      .from($$('tbody tr', t), { opacity: 0, x: -30, stagger: 0.12, duration: 0.7, ease: 'power3.out', onStart: () => sound.tick(2000, 0.03) })
      .from($$('tfoot tr', t), { opacity: 0, y: 20, stagger: 0.2, duration: 0.8, ease: 'expo.out' })
      .add(() => t.classList.add('is-summed'));
  });

  $$('.still').forEach((s) => {
    gsap.fromTo($('.still__frame', s), { clipPath: 'inset(12% 8% 12% 8%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: s, start: 'top bottom', end: 'center center', scrub: true },
    });
    gsap.fromTo($('img', s), { yPercent: -10, scale: 1.2 }, {
      yPercent: 10,
      scale: 1.05,
      ease: 'none',
      scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  $$('.delay').forEach((d) => {
    gsap.timeline({ scrollTrigger: { trigger: d, start: 'top 80%', end: 'bottom 50%', scrub: 1 } })
      .fromTo($('.delay__bar--long', d), { scaleX: 0 }, { scaleX: 1, ease: 'none' })
      .fromTo($('.delay__bar--short', d), { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0.6);
  });
}

function verbs() {
  const items = $$('.verb');
  if (!items.length) return;
  items.forEach((v, i) => {
    const l = $('.verb__l', v);
    const c = getComputedStyle(v).getPropertyValue('--c').trim();
    gsap.timeline({ scrollTrigger: { trigger: v, start: 'top 75%', once: true, onEnter: () => sound.tick(900 + i * 220, 0.05) } })
      .fromTo(l, { color: 'rgba(0,0,0,0)', webkitTextStroke: '1px rgba(236,231,225,.35)' }, { color: c, webkitTextStroke: '1px rgba(0,0,0,0)', duration: 0.9, ease: 'power2.out' })
      .from($('.adam__disc', v), { scale: 0, rotate: -120, duration: 0.8, ease: 'back.out(2)' }, 0.1);
  });
}

function rail() {
  const steps = $$('.rstep');
  if (!steps.length) return;
  const n = $('.rail__n');
  const phase = $('.rail__phase');
  const bar = $('.rail__bar span');
  const set = (step) => {
    const i = +step.dataset.step;
    n.textContent = String(i).padStart(2, '0');
    phase.textContent = step.parentElement.previousElementSibling?.dataset.phase || phase.textContent;
    gsap.to(bar, { scaleY: i / steps.length, duration: 0.6, ease: 'power3.out' });
    steps.forEach((s) => s.classList.toggle('is-active', s === step));
    sound.tick(1400 + i * 60, 0.03);
  };
  steps.forEach((s, i) => {
    ScrollTrigger.create({
      trigger: s,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: () => set(s),
      onEnterBack: () => set(s),
    });
    gsap.from(s, { opacity: 0.15, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 85%', once: true } });
    if (i === 0) set(s);
  });
}

function calculator() {
  const form = $('#calc-seuil');
  if (!form) return;
  form.addEventListener('submit', (e) => e.preventDefault());
  const inC = $('#calc-charges');
  const inR = $('#calc-reste');
  const inJ = $('#calc-jours');
  const rangeOut = $('.field__range', form);
  const out = $('#calc-resultat');
  out.setAttribute('aria-live', 'off');
  const sr = document.createElement('p');
  sr.className = 'sr-only';
  sr.setAttribute('aria-live', 'polite');
  form.append(sr);
  const big = $('[data-out="month"]', form);
  const mid = $('[data-out="day"]', form);
  const needle = $('.calc__needle', form);
  const keep = $('.calc__keep', form);
  const sup = $('.calc__part--sup', form);
  const kp = $('.calc__part--keep', form);
  const eur = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  const num = (v) => parseFloat(String(v).replace(/[\s  €]/g, '').replace(',', '.'));
  const shown = { m: 19667, d: 894 };
  let srT;

  const update = () => {
    const c = num(inC.value);
    const r = num(inR.value);
    const j = num(inJ.value);
    rangeOut.textContent = `${r} €`;
    gsap.to(needle, { rotation: -90 + r * 1.8, svgOrigin: '120 130', duration: 0.8, ease: 'elastic.out(1, 0.5)' });
    gsap.to(keep, { strokeDashoffset: 100 - r, duration: 0.6, ease: 'power3.out' });
    sup.style.flexBasis = `${100 - r}%`;
    kp.style.flexBasis = `${r}%`;
    sup.textContent = `${100 - r} € aux fournisseurs`;
    kp.textContent = `${r} € pour vous`;
    const ok = c > 0 && r > 0 && j > 0;
    inC.setAttribute('aria-invalid', String(!(c > 0)));
    inJ.setAttribute('aria-invalid', String(!(j > 0)));
    if (!ok) {
      big.textContent = '—';
      mid.textContent = '—';
      return;
    }
    const m = c / (r / 100);
    const d = m / j;
    gsap.to(shown, {
      m, d,
      duration: reduced ? 0 : 0.9,
      ease: 'power3.out',
      onUpdate: () => {
        big.textContent = `${eur.format(shown.m)} €`;
        mid.textContent = `${eur.format(shown.d)} €`;
      },
    });
    clearTimeout(srT);
    srT = setTimeout(() => {
      sr.textContent = `Seuil de rentabilité du mois : ${eur.format(m)} euros. À vendre chaque jour ouvré : ${eur.format(d)} euros.`;
    }, 700);
  };
  [inC, inR, inJ].forEach((i) => i.addEventListener('input', update));
  inR.addEventListener('input', () => sound.tick(2600 + +inR.value * 10, 0.02));
  inC.addEventListener('blur', () => { const c = num(inC.value); if (c > 0) inC.value = eur.format(c); });
  update();
  gsap.from(form, { opacity: 0, y: 60, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: form, start: 'top 85%', once: true } });
}

function costbar() {
  const bar = $('.costbar');
  if (!bar) return;
  const segs = $$('.costbar__seg', bar);
  gsap.set(segs, { scaleX: 0 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: bar, start: 'top 80%', end: 'top 30%', scrub: 1 } });
  segs.forEach((s, i) => tl.to(s, { scaleX: 1, ease: 'power2.out', duration: 1 }, i * 0.8));
  tl.from($$('.costbar__mark', bar), { opacity: 0, y: 10, stagger: 1.2, duration: 0.6 }, 2.4);

  $$('.remise__bar').forEach((b, i) => {
    gsap.from(b, { scaleX: 0, duration: 1.2, delay: i * 0.25, ease: 'expo.out', scrollTrigger: { trigger: b.closest('.remise'), start: 'top 80%', once: true } });
  });
}

function hreel() {
  const pin = $('.hreel__pin');
  if (!pin) return;
  const track = $('.hreel__track', pin);
  const dist = () => track.scrollWidth - innerWidth;
  const horiz = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
  });
  cinema(pin, 'top top', () => '+=' + dist());
  gsap.to($('.bilans__progress', pin), { scaleX: 1, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), scrub: true } });
  $$('.reel', track).forEach((reel) => {
    gsap.from(reel.children, {
      y: 60, opacity: 0, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: reel, containerAnimation: horiz, start: 'left 85%', end: 'left 45%', scrub: 1 },
    });
  });
}

function machine() {
  const m = $('.machine');
  if (!m) return;
  const wires = $$('.machine__wires path', m);
  wires.forEach((w) => {
    const l = w.getTotalLength();
    gsap.set(w, { strokeDasharray: l, strokeDashoffset: l });
  });
  gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 75%', once: true } })
    .from($$('.machine__nodes > g', m), { scale: 0, opacity: 0, transformOrigin: 'center', stagger: 0.12, duration: 0.8, ease: 'back.out(2)' })
    .to(wires, { strokeDashoffset: 0, duration: 1.2, stagger: 0.1, ease: 'power2.inOut' }, 0.3)
    .from($('.machine__pulses', m), { opacity: 0, duration: 0.6 }, '-=0.2');
}

function acrostic() {
  const pin = $('.acro__pin');
  if (!pin) return;
  const words = $$('.acro__w', pin);
  const tails = words.map((w) => $('span', w));
  gsap.set(tails, { opacity: 0, maxWidth: 0 });
  gsap.set($$('b', pin), { opacity: 0.25 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: pin, start: 'top top', end: '+=180%', pin: true, scrub: 1 } });
  cinema(pin, 'top top', '+=180%');
  words.forEach((w, i) => {
    tl.to($('b', w), { opacity: 1, color: 'var(--gold)', duration: 0.4 }, i)
      .to(tails[i], { opacity: 1, maxWidth: '12em', duration: 0.8, ease: 'power2.out' }, i + 0.15);
  });
  tl.add(shot({ flow: base.flow, color: 0 }, { flow: 0.6, duration: words.length }), 0);
}

function quoteSequence() {
  const pin = $('.qseq__pin');
  if (!pin) return;
  const qs = $$('.qseq__q', pin);
  gsap.set(qs.slice(1), { opacity: 0, y: 60, filter: 'blur(10px)' });
  const tl = gsap.timeline({ scrollTrigger: { trigger: pin, start: 'top top', end: '+=' + qs.length * 70 + '%', pin: true, scrub: 1 } });
  cinema(pin, 'top top', '+=' + qs.length * 70 + '%');
  qs.forEach((q, i) => {
    if (i === 0) return;
    tl.to(qs[i - 1], { opacity: 0, y: -60, filter: 'blur(10px)', duration: 1 })
      .to(q, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 }, '<0.4')
      .to({}, { duration: 0.6 });
  });
}

function phoneScene() {
  if (!$('.phone')) return;
  gsap.from('.phone', { rotationY: -50, rotationX: 20, y: 160, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.point', start: 'top 70%', once: true } });
  gsap.from('.tabs [role="tab"]', { y: 20, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.tabs', start: 'top 90%', once: true } });
}

function legalToc() {
  const links = $$('.legal__toc a');
  if (!links.length) return;
  links.forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) links.forEach((l) => l.classList.toggle('is-active', l === a));
      },
    });
  });
}

/* =========================================================
   Démarrage
   ========================================================= */
async function boot() {
  initReport();
  initMenu();
  initLinks();
  initVisibility();
  restoreSound();
  initCalculatorEarly();

  const stageReady = scene === 'none' ? Promise.resolve(false) : startStage();
  Object.assign(state, { dials: 0, backlight: 1, zoom: 1.5, liftY: 0, panX: 0, focusX: 0, speed: 0.55, fuel: 0.02, warn: 1, fade: 0.45, sat: 0.9, ...base });

  if (reduced) {
    clearTimeout(window.__barT);
    root.style.removeProperty('--bar');
    await stageReady;
    app.stage?.render(0.016);
    $$('[data-count]').forEach((el) => countUp(el));
    return;
  }

  initLenis();
  window.scrollTo(0, 0);
  initPointer();
  gsap.set('.phero [data-hero-fade]', { opacity: 0, translate: '0 24px' });

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  await Promise.all([stageReady, fontsReady]);
  heroIntro();
  initReveals();
  heroScroll();
  chapters();
  verbs();
  rail();
  costbar();
  hreel();
  machine();
  acrostic();
  quoteSequence();
  phoneScene();
  legalToc();
  if (app.stage) finaleScenes({ zoom: 1.5, fade: 0.45, flow: base.flow });
  else gsap.from('.credits__roll > *', { y: 60, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.credits', start: 'top 70%', once: true } });
  // le contenu replié change la hauteur de page : on recale les déclencheurs après ouverture
  $$('.more__box').forEach((d) => d.addEventListener('toggle', () => setTimeout(() => ScrollTrigger.refresh(), 750)));
  initHUD(runtime, 'Plan');
  ScrollTrigger.refresh();
  if (import.meta.env.DEV) window.__cador = { state, lenis: app.lenis, ScrollTrigger };
}

/** Le calculateur fonctionne aussi en mouvement réduit. */
function initCalculatorEarly() {
  calculator();
}

boot();
