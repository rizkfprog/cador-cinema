/* Socle commun à toutes les pages : polices, styles, scroll doux, curseur,
   menu, son, HUD, révélations, transitions entre pages, scène WebGL. */
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '../styles/main.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { state } from '../webgl/state.js';
import { Sound } from '../ui/sound.js';
import { REPORTS, QUESTIONS, frTypo } from '../data/report.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
// une scène qu'on dépasse en coup de vent est terminée tout de suite : les plans restent dans l'ordre
ScrollTrigger.defaults({ fastScrollEnd: true });
if (import.meta.env.DEV && new URLSearchParams(location.search).has('norafl')) setInterval(() => gsap.ticker.tick(), 16);

export { gsap, ScrollTrigger, SplitText, state };

export const root = document.documentElement;
export const $ = (s, c = document) => c.querySelector(s);
export const $$ = (s, c = document) => [...c.querySelectorAll(s)];
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const small = matchMedia('(max-width: 720px)').matches;

export const sound = new Sound();
/** Références mutables partagées (Lenis, scène). */
export const app = { lenis: null, stage: null };

if (!reduced) root.classList.add('motion');
$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* navigation privée */ } },
};
export { store };

/* =========================================================
   Utilitaires
   ========================================================= */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

const fmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
export function countUp(el, opts = {}) {
  const end = parseFloat(el.dataset.count);
  const dec = (el.dataset.count.split('.')[1] || '').length;
  const pre = el.dataset.prefix || '';
  const suf = el.dataset.suffix || '';
  const o = { v: 0 };
  const set = () => (el.textContent = pre + fmt.format(dec ? +o.v.toFixed(dec) : Math.round(o.v)) + suf);
  if (reduced) { o.v = end; set(); return; }
  gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: set, ...opts });
}

/** Un « plan » : transition explicite de l'état caméra (pas de valeurs de départ implicites). */
export function shot(from, to) {
  return gsap.fromTo(state, from, { ...to, immediateRender: false });
}

/* =========================================================
   Son (préférence conservée d'une page à l'autre)
   ========================================================= */
const soundBtn = $('.sound');
export function setSound(on) {
  sound.setOn(on);
  store.set('cador-sound', on ? '1' : '0');
  soundBtn.setAttribute('aria-pressed', String(on));
  soundBtn.setAttribute('aria-label', on ? "Couper le son d'ambiance" : "Activer le son d'ambiance");
}
soundBtn.addEventListener('click', () => setSound(!sound.on));

/** Le navigateur exige un geste avant de jouer du son : on l'arme et on attend le premier. */
export function restoreSound() {
  if (store.get('cador-sound') !== '1') return;
  soundBtn.setAttribute('aria-pressed', 'true');
  const go = () => {
    removeEventListener('pointerdown', go);
    removeEventListener('keydown', go);
    if (soundBtn.getAttribute('aria-pressed') === 'true') setSound(true);
  };
  addEventListener('pointerdown', go);
  addEventListener('keydown', go);
}

/* =========================================================
   Point du mois (onglets) — accueil et Suivi mensuel
   ========================================================= */
export function initReport() {
  const sheet = $('#sheet');
  if (!sheet) return;
  const dl = $('.sheet__qa', sheet);
  const ol = $('.sheet__acts ol', sheet);
  const who = $('.sheet__who', sheet);
  const tabs = $$('[role="tab"]', sheet.closest('section'));

  const render = (key) => {
    const r = REPORTS[key];
    who.textContent = r.who;
    dl.innerHTML = QUESTIONS.map((q, i) => `<div class="qa"><dt>${frTypo(q)}</dt><dd>${frTypo(r.a[i])}</dd></div>`).join('');
    ol.innerHTML = r.acts.map((a) => `<li>${frTypo(a)}</li>`).join('');
  };

  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    sheet.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
    sound.tick(1800, 0.04);
    const items = $$('.qa, .sheet__acts, .voice', sheet);
    if (reduced) { render(tab.dataset.sector); return; }
    gsap.to(items, {
      opacity: 0, y: -10, duration: 0.22, stagger: 0.02, ease: 'power2.in',
      onComplete: () => {
        render(tab.dataset.sector);
        sheet.scrollTop = 0;
        gsap.fromTo($$('.qa, .sheet__acts, .voice', sheet), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
      },
    });
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      let n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });
  render('com');
}

/* =========================================================
   Menu
   ========================================================= */
export function initMenu() {
  const btn = $('.menu-btn');
  const menu = $('#menu');
  const label = $('.menu-btn__label');
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.menu__list--pages a', menu).forEach((a) => {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });
  const open = () => {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    btn.setAttribute('aria-expanded', 'true');
    label.textContent = 'Fermer';
    app.lenis?.stop();
    sound.whoosh(0.7);
    if (!reduced) gsap.fromTo($$('.menu__list li', menu), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.8, delay: 0.25, ease: 'power3.out' });
    $('a', menu).focus({ preventScroll: true });
  };
  const close = (refocus = true) => {
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    label.textContent = 'Chapitres';
    app.lenis?.start();
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduced ? 0 : 900);
    if (refocus) btn.focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close() : open()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') close(); });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
}

/* =========================================================
   Liens : ancres en scroll doux, autres pages en « coupe »
   ========================================================= */
function shutter(close) {
  if (reduced) return Promise.resolve();
  root.style.setProperty('--bar', close ? '51vh' : '0px');
  return new Promise((r) => setTimeout(r, close ? 750 : 0));
}

/** À l'arrivée sur une page : les volets s'ouvrent. */
export function openShutter(delay = 0) {
  if (reduced) { root.style.removeProperty('--bar'); return; }
  setTimeout(() => {
    root.style.setProperty('--bar', '0px');
    setTimeout(() => root.style.removeProperty('--bar'), 1200);
  }, delay);
}

export function initLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    const samePage = url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');

    if (samePage) {
      e.preventDefault();
      const target = !url.hash || url.hash === '#top' ? 0 : $(url.hash);
      if (target === null) return;
      if (app.lenis) app.lenis.scrollTo(target, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else if (target === 0) window.scrollTo({ top: 0 });
      else target.scrollIntoView();
      if (target !== 0 && target.matches('section')) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
      return;
    }

    // autre page du site : fermeture des volets, puis navigation
    e.preventDefault();
    sound.whoosh(0.8);
    store.set('cador-cut', '1');
    shutter(true).then(() => (location.href = url.href));
  });

  // retour arrière depuis le cache du navigateur : rouvrir les volets
  addEventListener('pageshow', (e) => { if (e.persisted) openShutter(); });
}

/* =========================================================
   Curseur, magnétisme, lumière des cartes, téléphone
   ========================================================= */
export function initPointer() {
  if (!finePointer || reduced) return;
  root.classList.add('has-cursor');
  const cur = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const label = $('.cursor__label');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };
  const setDot = { x: gsap.quickSetter(dot, 'x', 'px'), y: gsap.quickSetter(dot, 'y', 'px') };
  const setRing = { x: gsap.quickSetter(ring, 'x', 'px'), y: gsap.quickSetter(ring, 'y', 'px') };
  addEventListener('pointermove', (e) => { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.16;
    ringPos.y += (pos.y - ringPos.y) * 0.16;
    setDot.x(pos.x); setDot.y(pos.y);
    setRing.x(ringPos.x); setRing.y(ringPos.y);
  });
  let last = null;
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, [role="tab"], summary, input, label');
    cur.classList.toggle('is-link', !!t && !t.dataset.cursor);
    cur.classList.toggle('is-label', !!t?.dataset.cursor);
    label.textContent = t?.dataset.cursor || '';
    if (t && t !== last) sound.tick(3200, 0.015);
    last = t;
  });
  document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0, duration: 0.3 }));
  document.addEventListener('pointerenter', () => gsap.to(cur, { opacity: 1, duration: 0.3 }));

  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.32);
      yTo((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' }));
  });

  $$('.tcard, .card').forEach((c) => c.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`);
    c.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  const phone = $('.phone');
  if (phone) {
    const zone = phone.closest('section');
    const rx = gsap.quickTo(phone, 'rotationX', { duration: 1.2, ease: 'power3.out' });
    const ry = gsap.quickTo(phone, 'rotationY', { duration: 1.2, ease: 'power3.out' });
    zone.addEventListener('pointermove', (e) => {
      if (innerWidth <= 1080) return;
      ry(-14 + (e.clientX / innerWidth - 0.5) * 18);
      rx(6 - (e.clientY / innerHeight - 0.5) * 10);
    });
  }
}

/* =========================================================
   HUD : timecode, acte, réservoir de lecture
   ========================================================= */
export function initHUD(runtime = 360, actWord = 'Acte') {
  const tc = $('.timecode__tc');
  const act = $('.timecode__act');
  const fill = $('.tank__fill');
  const needle = $('.tank__needle');
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const p = self.progress;
      const sec = p * runtime;
      tc.textContent = `00:${pad(sec / 60)}:${pad(sec % 60)}:${pad((sec % 1) * 24)}`;
      fill.style.strokeDashoffset = String(100 - p * 100);
      needle.style.transform = `rotate(${-90 + p * 180}deg)`;
    },
  });

  $$('[data-act]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (!self.isActive) return;
        act.textContent = `${actWord} ${sec.dataset.act} · ${sec.dataset.actName}`;
        sound.tick(1200, 0.03);
      },
    });
  });
}

export function cinema(trigger, start = 'top top', end = 'bottom bottom') {
  ScrollTrigger.create({ trigger, start, end, onToggle: (self) => root.classList.toggle('is-cinema', self.isActive) });
}

/* =========================================================
   Révélations génériques
   ========================================================= */
export function initReveals({ skip = '.hero, .phero' } = {}) {
  $$('[data-split]').forEach((el) => {
    if (el.closest(skip)) return;
    SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.words, {
          yPercent: 110,
          rotate: 4,
          duration: 1.2,
          stagger: 0.04,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      },
    });
  });

  $$('[data-fade]').forEach((el) => {
    if (el.closest(skip)) return;
    gsap.to(el, {
      opacity: 1,
      translate: '0 0',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  $$('[data-scrub-words]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'w' });
    gsap.to(split.words, {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: el.closest('.constat') ? undefined : { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 1 },
    });
    el._words = split.words;
  });

  $$('[data-count]').forEach((el) => {
    if (el.closest('.bilans, [data-count-manual]')) return;
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => countUp(el) });
  });
}

/* =========================================================
   Lenis
   ========================================================= */
export function initLenis() {
  const lenis = (app.lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2 }));
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ({ velocity }) => {
    const v = Math.min(1, Math.abs(velocity) / 60);
    state.vel = v * 0.25;
    sound.setRev(v);
  });
  return lenis;
}

/* =========================================================
   Onglet masqué : le film se met en pause
   ========================================================= */
export function initVisibility() {
  const title = document.title;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.title = '⏸ Le film est en pause · CADOR';
      sound.suspend();
      app.stage?.setActive(false);
    } else {
      document.title = title;
      sound.resume();
      app.stage?.setActive(true);
    }
  });
}

/* =========================================================
   Scène WebGL (chargée à la demande)
   ========================================================= */
export function startStage() {
  if (!hasWebGL()) return Promise.resolve(false);
  root.classList.add('webgl');
  return import('../webgl/stage.js')
    .then(({ Stage }) => {
      app.stage = new Stage($('#stage'), { lowPower: small || (navigator.hardwareConcurrency || 8) <= 4, reduced });
      return app.stage.init();
    })
    .then(
      () => {
        if (!reduced) gsap.ticker.add(() => app.stage.tick());
        return true;
      },
      (err) => {
        console.warn('WebGL indisponible', err);
        root.classList.remove('webgl');
        app.stage = null;
        return false;
      }
    );
}

/** Commun à toutes les pages : la jauge revient et fait le plein au contact, puis fondu au noir. */
export function finaleScenes(from = { zoom: 1.5, fade: 0.7, flow: 0.3 }) {
  if ($('.contact')) {
    let filled = false;
    gsap.timeline({
      scrollTrigger: {
        trigger: '.contact',
        start: 'top 95%',
        end: 'top top',
        scrub: 1,
        onUpdate: (self) => {
          if (self.progress > 0.95 && !filled) { filled = true; sound.chime(); }
          if (self.progress < 0.6) filled = false;
        },
      },
    })
      .add(shot({ dials: 0, liftY: 0, panX: 0, focusX: 0, sat: 0.9, color: 0, ...from }, { dials: 1, zoom: 0.78, panX: -1.5, focusX: 1, fade: 0.12, sat: 1, flow: 0.15, color: 0, ease: 'power2.out', duration: 0.5 }), 0)
      .add(shot({ fuel: 0.02, warn: 1, speed: 0.92 }, { fuel: 1, warn: 0, speed: 0.55, ease: 'power2.inOut', duration: 0.6 }), 0.35);
  }
  gsap.fromTo(state, { fade: $('.contact') ? 0.12 : from.fade }, {
    fade: 1,
    ease: 'none',
    immediateRender: false,
    scrollTrigger: { trigger: '.credits', start: 'top 70%', end: 'center center', scrub: true },
  });
  gsap.from('.credits__roll > *', { y: 60, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.credits', start: 'top 70%', once: true } });
}
