import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export { state } from './state.js';
import { state } from './state.js';

const COLORS = {
  gold: new THREE.Color('#e2c49a'),
  sand: new THREE.Color('#bca48f'),
  red: new THREE.Color('#ff3b1f'),
  amber: new THREE.Color('#ffae2b'),
};

const SPEEDO = { start: (225 * Math.PI) / 180, sweep: (270 * Math.PI) / 180 };
const FUEL = { start: (210 * Math.PI) / 180, sweep: (240 * Math.PI) / 180 };

/* ------------------------------------------------------------------
   Textures de cadran dessinées au canvas 2D
------------------------------------------------------------------ */
function dialCanvas(kind, layer) {
  const S = 2048;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const R = S / 2;
  g.translate(R, R);
  const cfg = kind === 'speed' ? SPEEDO : FUEL;

  if (layer === 'base') {
    const grd = g.createRadialGradient(0, -R * 0.2, R * 0.05, 0, 0, R);
    grd.addColorStop(0, '#1d1c19');
    grd.addColorStop(0.7, '#0c0c0b');
    grd.addColorStop(1, '#050505');
    g.fillStyle = grd;
    g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
    // brossage circulaire
    for (let i = 0; i < 260; i++) {
      g.strokeStyle = `rgba(255,255,255,${Math.random() * 0.018})`;
      g.lineWidth = 1 + Math.random() * 2;
      g.beginPath(); g.arc(0, 0, R * (0.1 + Math.random() * 0.88), 0, Math.PI * 2); g.stroke();
    }
  } else {
    g.fillStyle = '#000';
    g.fillRect(-R, -R, S, S);
  }

  const tickCol = layer === 'base' ? 'rgba(188,164,143,0.55)' : '#e2c49a';
  const textCol = layer === 'base' ? 'rgba(236,231,225,0.75)' : '#f4e3c6';
  const angleAt = (t) => cfg.start - t * cfg.sweep;
  // canvas: y vers le bas → on inverse le sinus
  const pt = (a, r) => [Math.cos(a) * r, -Math.sin(a) * r];

  if (kind === 'speed') {
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const major = i % 10 === 0;
      const mid = i % 5 === 0;
      const a = angleAt(t);
      const r1 = R * 0.9;
      const r0 = r1 - (major ? R * 0.11 : mid ? R * 0.07 : R * 0.04);
      const [x0, y0] = pt(a, r0);
      const [x1, y1] = pt(a, r1);
      g.strokeStyle = t > 0.84 ? (layer === 'base' ? 'rgba(229,67,43,.7)' : '#ff4a2a') : tickCol;
      g.lineWidth = major ? 10 : mid ? 6 : 3;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      if (major) {
        const [tx, ty] = pt(a, R * 0.64);
        g.fillStyle = textCol;
        g.font = `400 ${R * 0.15}px "Instrument Serif", serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(String((i / 10) * 20), tx, ty);
      }
    }
    g.fillStyle = textCol;
    g.font = `500 ${R * 0.062}px "JetBrains Mono", monospace`;
    g.textAlign = 'center';
    g.fillText('V E N T E S', 0, R * 0.42);
    g.font = `400 ${R * 0.045}px "JetBrains Mono", monospace`;
    g.fillStyle = layer === 'base' ? 'rgba(143,134,124,.9)' : '#9b8a72';
    g.fillText('k€ / mois', 0, R * 0.52);
  } else {
    const N = 32;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const major = i % 8 === 0;
      const mid = i % 4 === 0;
      const a = angleAt(t);
      const r1 = R * 0.9;
      const r0 = r1 - (major ? R * 0.13 : mid ? R * 0.08 : R * 0.045);
      const [x0, y0] = pt(a, r0);
      const [x1, y1] = pt(a, r1);
      g.strokeStyle = t < 0.2 ? (layer === 'base' ? 'rgba(229,67,43,.75)' : '#ff4a2a') : tickCol;
      g.lineWidth = major ? 12 : mid ? 7 : 4;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    const labels = [['E', 0], ['¼', 0.25], ['½', 0.5], ['¾', 0.75], ['F', 1]];
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const [l, t] of labels) {
      const [tx, ty] = pt(angleAt(t), R * 0.62);
      g.fillStyle = l === 'E' ? (layer === 'base' ? 'rgba(229,67,43,.9)' : '#ff5a3a') : textCol;
      g.font = `400 ${R * (l.length === 1 && /[EF]/.test(l) ? 0.2 : 0.14)}px "Instrument Serif", serif`;
      g.fillText(l, tx, ty);
    }
    g.fillStyle = textCol;
    g.font = `500 ${R * 0.06}px "JetBrains Mono", monospace`;
    g.fillText('C E  Q U I  R E S T E', 0, R * 0.44);
    g.font = `400 ${R * 0.045}px "JetBrains Mono", monospace`;
    g.fillStyle = layer === 'base' ? 'rgba(143,134,124,.9)' : '#9b8a72';
    g.fillText('une fois tout payé', 0, R * 0.54);
  }
  return c;
}

function pumpCanvas() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  g.lineWidth = 12;
  g.lineJoin = 'round';
  // corps
  g.beginPath(); g.roundRect(56, 52, 96, 160, 12); g.fill();
  g.fillStyle = '#000';
  g.fillRect(72, 70, 64, 44);
  g.fillStyle = '#fff';
  g.fillRect(40, 204, 128, 18);
  // tuyau
  g.beginPath(); g.moveTo(152, 92); g.lineTo(186, 92); g.lineTo(196, 170); g.quadraticCurveTo(200, 196, 214, 182); g.lineTo(206, 82); g.lineTo(184, 60); g.stroke();
  return c;
}

/* ------------------------------------------------------------------
   Matériaux shader
------------------------------------------------------------------ */
function arcMaterial(cfg, color) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uValue: { value: 0 },
      uStart: { value: cfg.start },
      uSweep: { value: cfg.sweep },
      uColor: { value: color.clone() },
      uIntensity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vP;
      uniform float uValue, uStart, uSweep, uIntensity;
      uniform vec3 uColor;
      const float PI = 3.14159265;
      void main(){
        float a = atan(vP.y, vP.x);
        float d = uStart - a;
        d = mod(d + 2.0*PI, 2.0*PI);
        float t = d / uSweep;
        if (t > 1.0) discard;
        float lit = smoothstep(uValue + 0.004, uValue - 0.004, t);
        float r = length(vP);
        float band = smoothstep(0.80, 0.83, r) * (1.0 - smoothstep(0.85, 0.88, r));
        float glow = mix(0.06, 1.0, lit) * band;
        float head = exp(-pow((t - uValue) * 60.0, 2.0)) * band * 2.5;
        gl_FragColor = vec4(uColor * (glow + head) * uIntensity, 1.0);
      }
    `,
  });
}

const FinalShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAberr: { value: 0 },
    uSat: { value: 0.9 },
    uFade: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uAberr, uSat, uFade;
    uniform vec2 uRes;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5;
      float dist = length(c);
      vec2 off = c * (0.0025 + uAberr * 0.03) * (0.4 + dist);
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(l), col, uSat);
      // vignette
      col *= smoothstep(0.95, 0.25, dist * 1.15);
      // grain
      float n = hash(vUv * uRes + fract(uTime * 13.7) * 100.0) - 0.5;
      col += n * 0.045;
      col *= 1.0 - uFade;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

/* ------------------------------------------------------------------
   Scène
------------------------------------------------------------------ */
export class Stage {
  constructor(canvas, { lowPower = false, reduced = false } = {}) {
    this.canvas = canvas;
    this.lowPower = lowPower;
    this.reduced = reduced;
    this.mouse = new THREE.Vector2();
    this.mouseS = new THREE.Vector2();
    this.time = 0;
    this.last = performance.now();
    this.needle = { speed: 0, speedV: 0, fuel: 0.5, fuelV: 0 };
    this.active = true;
  }

  async init() {
    const { canvas } = this;
    const renderer = (this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    }));
    renderer.setClearColor(0x0a0a09, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = (this.scene = new THREE.Scene());
    scene.fog = new THREE.FogExp2(0x0a0a09, 0.06);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 0, 9);

    // lumières
    const key = new THREE.SpotLight(0xffe2b8, 22, 30, 0.45, 0.7, 1.4);
    key.position.set(-3, 5, 7);
    scene.add(key, key.target);
    const rim = new THREE.PointLight(0xbca48f, 8, 20, 2);
    rim.position.set(4, -2, 3);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x1a1712, 1));

    if (document.fonts) {
      try {
        await Promise.all([
          document.fonts.load('400 120px "Instrument Serif"'),
          document.fonts.load('500 60px "JetBrains Mono"'),
        ]);
      } catch (e) { /* polices facultatives */ }
    }

    this.cluster = new THREE.Group();
    scene.add(this.cluster);
    this.speedo = this.makeDial('speed');
    this.fuelG = this.makeDial('fuel');
    this.cluster.add(this.speedo.group, this.fuelG.group);
    this.makeWarning();
    this.makeParticles();

    // post-traitement
    const composer = (this.composer = new EffectComposer(renderer));
    composer.addPass(new RenderPass(scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.4, 0.82);
    composer.addPass(this.bloom);
    composer.addPass(new OutputPass());
    this.final = new ShaderPass(FinalShader);
    composer.addPass(this.final);

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', (e) => {
      this.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    }, { passive: true });
  }

  makeDial(kind) {
    const cfg = kind === 'speed' ? SPEEDO : FUEL;
    const group = new THREE.Group();
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();

    const baseTex = new THREE.CanvasTexture(dialCanvas(kind, 'base'));
    baseTex.colorSpace = THREE.SRGBColorSpace;
    baseTex.anisotropy = maxAniso;
    const emTex = new THREE.CanvasTexture(dialCanvas(kind, 'emissive'));
    emTex.colorSpace = THREE.SRGBColorSpace;
    emTex.anisotropy = maxAniso;

    const faceMat = new THREE.MeshStandardMaterial({
      map: baseTex,
      emissiveMap: emTex,
      emissive: new THREE.Color(1, 0.86, 0.66),
      emissiveIntensity: 0,
      roughness: 0.7,
      metalness: 0.1,
      envMapIntensity: 0.15,
    });
    const face = new THREE.Mesh(new THREE.CircleGeometry(1, 128), faceMat);
    group.add(face);

    // arc de valeur lumineux
    const arcMat = arcMaterial(cfg, kind === 'speed' ? COLORS.gold : COLORS.gold);
    const arc = new THREE.Mesh(new THREE.RingGeometry(0.78, 0.9, 256, 1), arcMat);
    arc.position.z = 0.004;
    group.add(arc);

    // lunette or
    const gold = new THREE.MeshStandardMaterial({ color: 0xb8976f, metalness: 1, roughness: 0.34, envMapIntensity: 0.45 });
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.035, 0.05, 48, 200), gold);
    bezel.position.z = 0.03;
    group.add(bezel);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.985, 0.012, 16, 200), gold);
    inner.position.z = 0.02;
    group.add(inner);

    // fût
    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(1.085, 1.085, 0.5, 128, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x0d0d0c, metalness: 0.85, roughness: 0.35, side: THREE.DoubleSide })
    );
    housing.rotation.x = Math.PI / 2;
    housing.position.z = -0.2;
    group.add(housing);

    // aiguille
    const shape = new THREE.Shape();
    shape.moveTo(-0.028, -0.16);
    shape.lineTo(0.028, -0.16);
    shape.lineTo(0.009, 0.86);
    shape.lineTo(-0.009, 0.86);
    shape.closePath();
    const needleGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
    const needleMat = new THREE.MeshStandardMaterial({
      color: 0xff3b1f,
      emissive: 0xff2a10,
      emissiveIntensity: 2.4,
      roughness: 0.4,
    });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    const pivot = new THREE.Group();
    pivot.position.z = 0.05;
    pivot.add(needle);
    group.add(pivot);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.06, 48), new THREE.MeshStandardMaterial({ color: 0x111110, metalness: 0.9, roughness: 0.3 }));
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.09;
    group.add(cap);
    const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.008, 12, 64), gold);
    capRing.position.z = 0.12;
    group.add(capRing);

    // reflet de verre
    const glass = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 96),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uShift: { value: 0 } },
        vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
        fragmentShader: `varying vec2 vP; uniform float uShift;
          void main(){
            float d = dot(vP, normalize(vec2(-0.7, 1.0))) + uShift;
            float s = smoothstep(0.25, 0.55, d) * (1.0 - smoothstep(0.55, 0.95, d));
            float edge = smoothstep(0.8, 1.0, length(vP));
            gl_FragColor = vec4(vec3(1.0, 0.95, 0.88) * (s * 0.035 + edge * 0.015), 1.0);
          }`,
      })
    );
    glass.position.z = 0.14;
    group.add(glass);

    return { group, faceMat, arcMat, pivot, glass, cfg, kind };
  }

  makeWarning() {
    const tex = new THREE.CanvasTexture(pumpCanvas());
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: COLORS.amber, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    mat.color.multiplyScalar(2.2);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), mat);
    m.position.set(0, -0.22, 0.03);
    this.fuelG.group.add(m);
    this.warnMat = mat;
  }

  makeParticles() {
    const count = this.lowPower ? 700 : 1800;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const tint = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = -8 + Math.random() * 11;
      seed[i] = Math.random();
      tint[i] = Math.floor(Math.random() * 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aTint', new THREE.BufferAttribute(tint, 1));
    this.pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uFlow: { value: 0 },
        uOpacity: { value: 1 },
        uColor: { value: 0 },
        uPx: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed; attribute float aTint;
        uniform float uTime, uFlow, uPx;
        varying float vSeed; varying float vTint;
        void main(){
          vec3 p = position;
          p.y = mod(p.y + uFlow + aSeed * 12.0 + 6.0, 12.0) - 6.0;
          p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.25;
          p.z += cos(uTime * 0.2 + aSeed * 20.0) * 0.2;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float s = mix(1.5, 5.5, aSeed * aSeed);
          gl_PointSize = s * uPx * (6.0 / -mv.z);
          vSeed = aSeed; vTint = aTint;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime, uOpacity, uColor;
        varying float vSeed; varying float vTint;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float a = smoothstep(0.5, 0.0, d);
          a *= 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + vSeed * 2.0) + vSeed * 30.0));
          vec3 gold = vec3(0.89, 0.77, 0.6);
          vec3 adam = vTint < 0.5 ? vec3(0.95,0.82,0.24) : vTint < 1.5 ? vec3(0.1,0.65,0.88) : vTint < 2.5 ? vec3(0.42,0.75,0.29) : vec3(0.94,0.33,0.23);
          vec3 col = mix(gold, adam * 1.4, uColor);
          gl_FragColor = vec4(col * a * uOpacity, 1.0);
        }
      `,
    });
    this.points = new THREE.Points(geo, this.pMat);
    this.scene.add(this.points);
    this.flowAcc = 0;
  }

  layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    this.portrait = aspect < 0.85;
    if (this.portrait) {
      this.speedo.group.position.set(0, 1.25, 0);
      this.speedo.group.rotation.set(0, 0, 0);
      this.speedo.group.scale.setScalar(1);
      this.fuelG.group.position.set(0, -1.05, 0);
      this.fuelG.group.rotation.set(0, 0, 0);
      this.fuelG.group.scale.setScalar(0.82);
      this.contentW = 2.6;
      this.contentH = 5.0;
    } else {
      this.speedo.group.position.set(-1.25, 0, 0);
      this.speedo.group.rotation.set(0, 0.16, 0);
      this.speedo.group.scale.setScalar(1);
      this.fuelG.group.position.set(1.3, -0.12, 0);
      this.fuelG.group.rotation.set(0, -0.16, 0);
      this.fuelG.group.scale.setScalar(0.8);
      this.contentW = 5.4;
      this.contentH = 2.6;
    }
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const fitH = this.contentH / 2 / Math.tan(vFov / 2);
    const fitW = this.contentW / 2 / (Math.tan(vFov / 2) * aspect);
    this.fitZ = Math.max(fitH, fitW) * 1.12;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, this.lowPower ? 1.25 : 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.final.uniforms.uRes.value.set(w, h);
    this.pMat.uniforms.uPx.value = dpr;
    this.layout();
    if (this.reduced) this.render(0.016);
  }

  setActive(on) { this.active = on; }

  spring(cur, vel, target, dt, k = 60, c = 11) {
    const a = (target - cur) * k - vel * c;
    vel += a * dt;
    cur += vel * dt;
    return [cur, vel];
  }

  render(dt) {
    const t = this.time;
    const s = state;
    if (this.reduced) Object.assign(this.needle, { speed: s.speed, speedV: 0, fuel: s.fuel, fuelV: 0 });

    // aiguilles à ressort
    const jitter = s.speed > 0.6 ? Math.sin(t * 47) * 0.002 + Math.sin(t * 31) * 0.0015 : 0;
    [this.needle.speed, this.needle.speedV] = this.spring(this.needle.speed, this.needle.speedV, s.speed + jitter, Math.min(dt, 0.033));
    const fuelTarget = s.fuel + (s.warn > 0.5 ? Math.sin(t * 2.2) * 0.006 : 0);
    [this.needle.fuel, this.needle.fuelV] = this.spring(this.needle.fuel, this.needle.fuelV, fuelTarget, Math.min(dt, 0.033), 40, 10);

    const setDial = (d, v) => {
      const a = d.cfg.start - THREE.MathUtils.clamp(v, -0.02, 1.02) * d.cfg.sweep;
      d.pivot.rotation.z = a - Math.PI / 2;
      d.arcMat.uniforms.uValue.value = THREE.MathUtils.clamp(v, 0, 1);
      d.arcMat.uniforms.uIntensity.value = 1.2 * s.backlight;
      d.faceMat.emissiveIntensity = 0.8 * s.backlight;
      d.glass.material.uniforms.uShift.value = this.mouseS.x * 0.15 + s.focusX * 0.1;
    };
    setDial(this.speedo, this.needle.speed);
    setDial(this.fuelG, this.needle.fuel);

    // couleur de l'arc de jauge : rouge en réserve, or quand plein
    const fuelCol = this.fuelG.arcMat.uniforms.uColor.value;
    fuelCol.copy(COLORS.red).lerp(COLORS.gold, THREE.MathUtils.smoothstep(this.needle.fuel, 0.15, 0.45));

    // voyant réserve : pulsation lente (1 Hz, sans flash)
    this.warnMat.opacity = s.warn * s.backlight * (0.55 + 0.45 * Math.sin(t * Math.PI * 2 * 0.9));

    // présence des cadrans
    const dScale = THREE.MathUtils.lerp(0.6, 1, s.dials);
    this.cluster.scale.setScalar(dScale);
    this.cluster.visible = s.dials > 0.01;
    this.cluster.position.z = THREE.MathUtils.lerp(-6, 0, s.dials);

    // caméra
    this.mouseS.lerp(this.mouse, 0.05);
    const focusTarget = this.portrait
      ? new THREE.Vector3(0, s.focusX < 0 ? 1.25 * -s.focusX : -1.05 * s.focusX, 0)
      : new THREE.Vector3(s.focusX < 0 ? -1.25 * -s.focusX : 1.3 * s.focusX, 0, 0);
    focusTarget.multiplyScalar(dScale);
    const z = this.fitZ * s.zoom;
    const shakeX = s.shake * (Math.sin(t * 61) * 0.05 + Math.sin(t * 37) * 0.03);
    const shakeY = s.shake * Math.cos(t * 53) * 0.05;
    const cam = this.camera;
    const pan = this.portrait ? 0 : s.panX * z * 0.18;
    cam.position.set(
      focusTarget.x + pan + this.mouseS.x * 0.35 + shakeX,
      focusTarget.y + this.mouseS.y * 0.25 - s.liftY + shakeY + s.tilt * -1.2,
      z
    );
    cam.lookAt(focusTarget.x + pan, focusTarget.y - s.liftY, 0);
    cam.rotation.z += s.tilt * 0.08;

    // particules
    this.flowAcc += dt * s.flow;
    this.pMat.uniforms.uTime.value = t;
    this.pMat.uniforms.uFlow.value = this.flowAcc;
    this.pMat.uniforms.uOpacity.value = s.particles;
    this.pMat.uniforms.uColor.value = s.color;
    this.points.rotation.y = t * 0.01;

    // final
    const f = this.final.uniforms;
    f.uTime.value = t;
    f.uAberr.value = s.aberr + s.vel;
    f.uSat.value = s.sat;
    f.uFade.value = s.fade;
    this.bloom.strength = 0.25 + 0.4 * s.backlight;

    this.composer.render(dt);
  }

  tick() {
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    this.time += dt;
    if (!this.active || state.fade > 0.995) return;
    this.render(dt);
  }
}
