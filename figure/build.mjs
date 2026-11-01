// Fig. 1 del hero: sonda de muestreo sobre un monolito de suelo.
// Genera el fragmento HTML de la figura y su script en vivo con el kit de Anatomy.
//   node figure/build.mjs            → src/generated/soil-rig.html + soil-rig-live.js
//   node figure/build.mjs --preview  → además figure/preview.html (página suelta para revisar)
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import { horizons, sampleDepth } from "../src/data/site.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

// ---------------------------------------------------------------- modelo
const CM = 3; // unidades de mundo por centímetro
const SOIL_CM = 45; // el monolito muestra 45 cm de perfil
const TRAY_H = 5;
const SOIL_TOP = TRAY_H + SOIL_CM * CM; // 140
const DEPTH_MIN = -4; // sonda fuera, 4 cm sobre el suelo
const DEPTH_MAX = 36;
const SHOWN = horizons.filter((h) => h.from < SOIL_CM);
const zOf = (cm) => SOIL_TOP - cm * CM;

// ---------------------------------------------------------------- planta
const WIDTH = 440;
const HEIGHT = 600;
const PLATE = { x: -78, y: -42, w: 126, d: 84, r: 6 };
const PLATE_H = 9;
const FOOT_H = 4;
const TRAY = { x: -37, y: -30, w: 72, d: 57, r: 2 };
const SOIL = { x: -32, y: -25, w: 64, d: 49, r: 0.6 };
const WALL_TOP = SOIL_TOP + 8;
const WALL_BACK = { x: -35, y: -28, w: 70, d: 3, r: 0.6 };
const WALL_SIDE = { x: -35, y: -25, w: 3, d: 49, r: 0.6 };
const STICK = { x: SOIL.x + SOIL.w, y: SOIL.y + SOIL.d - 5, w: 2.4, d: 5, r: 0.4 };

const COLUMN = [-60, 0];
const COLUMN_R = 5;
const COLUMN_TOP = 318;
const RACK = { x: -62, y: 4.4, w: 4, d: 1.8, r: 0.3 };

// Grupo móvil construido con la punta a ras de suelo (profundidad 0).
const PROBE_R = 4;
const PROBE_L = 150;
const PROBE_TOP = SOIL_TOP + PROBE_L;
const CLAMP = { x: -PROBE_R - 4.4, y: -5, w: 4.4, d: 10, r: 0.8 };
const CLAMP_Z = [PROBE_TOP - 28, PROBE_TOP - 14];
const ARM = { x: -49, y: -3, w: 49 - PROBE_R - 4.4, d: 6, r: 1 };
const ARM_Z = [PROBE_TOP - 24, PROBE_TOP - 18];
const CARRIAGE = { x: -55, y: -8, w: 6, d: 16, r: 1.2 };
const CARRIAGE_Z = [PROBE_TOP - 32, PROBE_TOP - 8];
const HANDLE = { x: -1.8, y: -17, w: 3.6, d: 34, r: 1.6 };
const HANDLE_Z = PROBE_TOP + 4;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [COLUMN[0], COLUMN[1], COLUMN_TOP + 3],
    [0, HANDLE.y, HANDLE_Z + 4 - DEPTH_MIN * CM],
    [0, HANDLE.y + HANDLE.d, HANDLE_Z + 4 - DEPTH_MIN * CM],
  ],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 48 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const [VX, VY] = k.towardViewer(P);

// Generador determinista para las texturas del suelo.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

// ---------------------------------------------------------------- piezas fijas
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 14))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));

  // Placa de identificación con tres renglones, junto a la columna.
  const tag = { x: -72, y: 12, w: 24, d: 18, r: 1.2 };
  out.push(S(k.slabOf(tag, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(tag, 1.6), 0.8, P, 4), { tone: "faint" }));
  [[4, 20], [8, 16], [12, 12]].forEach(([dy, len]) => {
    out.push(L(k.lineOnTop([tag.x + 2.4, tag.y + dy], [tag.x + 2.4 + len * 0.95, tag.y + dy], 0.8, P), { tone: "lo", free: true }));
  });
  out.push(D([at([tag.x + tag.w - 2.6, tag.y + 2.6, 0.8]), at([tag.x + tag.w - 2.6, tag.y + tag.d - 2.6, 0.8])], { size: 0.45 }));
  return out.join("");
}

function column() {
  const [cx, cy] = COLUMN;
  const out = [];
  out.push(S(k.cylinder(cx, cy, 9, 0, 2, P, 40, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, 7.4, 2, 5, P, 40), { tone: "mid" }));
  out.push(D(byDepth([[cx + 6.6, cy], [cx - 6.6, cy], [cx, cy + 6.6], [cx, cy - 6.6]]).map(([x, y]) => at([x, y, 2])), { size: 0.45 }));
  out.push(S(k.cylinder(cx, cy, COLUMN_R, 7, COLUMN_TOP - 7, P, 40), { tone: "mid", crease: "none" }));
  out.push(L(k.sideArc(cx, cy, COLUMN_R, 7, P, 24), { tone: "lo" }));
  // Cremallera: dientes de lado a lado de su cara frontal.
  out.push(S(k.slabOf(RACK, 12, COLUMN_TOP - 20, P, 2), { tone: "mid", crease: "none" }));
  const face = RACK.y + RACK.d;
  const teeth = [];
  for (let z = 16; z < COLUMN_TOP - 10; z += 2.4) teeth.push(k.segment([RACK.x, face, z], [RACK.x + RACK.w, face, z], P));
  out.push(L(teeth.join(""), { tone: "faint" }));
  out.push(S(k.cylinder(cx, cy, 5.8, COLUMN_TOP, 3, P, 40, 0.4), { tone: "mid" }));
  out.push(D([at([cx, cy, COLUMN_TOP + 3])], { size: 0.5 }));
  return out.join("");
}

function backWalls() {
  const out = [];
  out.push(S(k.slabOf(TRAY, 0, TRAY_H, P, 4, 0.6), { tone: "mid" }));
  out.push(S(k.slabOf(WALL_BACK, TRAY_H, WALL_TOP - TRAY_H, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf(WALL_SIDE, TRAY_H, WALL_TOP - TRAY_H, P, 3, 0.4), { tone: "mid" }));
  out.push(D([[-33.5, -26.5], [30, -26.5], [-33.5, 20]].map(([x, y]) => at([x, y, WALL_TOP])), { size: 0.45 }));
  return out.join("");
}

// Cada horizonte es una capa del monolito; su color Munsell es el tema de la figura.
function soil() {
  const out = [];
  const front = SOIL.y + SOIL.d;
  const right = SOIL.x + SOIL.w;
  const r = rng(41);
  [...SHOWN].reverse().forEach((h) => {
    const z0 = zOf(Math.min(h.to, SOIL_CM));
    const z1 = zOf(h.from);
    out.push(S(k.slabOf(SOIL, z0, z1 - z0, P, 2), { tone: "lo", crease: "lo", className: `soil soil-${h.id.toLowerCase()}` }));
    if (h.id === "B") {
      // Piedrecitas y moteado en el subsuelo, sobre las dos caras visibles.
      const stones = [];
      for (let i = 0; i < 16; i++) {
        const onFront = i % 2 === 0;
        const z = z0 + 4 + r() * (z1 - z0 - 8);
        const along = 5 + r() * 54;
        const rad = 0.8 + r() * 1.4;
        stones.push(onFront ? k.sideRing([SOIL.x + along, front, z], rad, "y", P, 14) : k.sideRing([right, SOIL.y + 4 + r() * 40, z], rad, "x", P, 14));
      }
      out.push(`<path class="soil-stone" d="${stones.join("")}"/>`);
    }
    if (h.id === "A") {
      // Raíces finas que bajan desde el horizonte O y se desvanecen.
      out.push('<g class="soil-roots">');
      for (let i = 0; i < 9; i++) {
        const onFront = i < 6;
        const start = onFront ? 4 + i * 10 + r() * 5 : SOIL.y + 6 + (i - 6) * 13 + r() * 5;
        const pts = [];
        let drift = 0;
        const len = 24 + r() * 34;
        for (let t = 0; t <= len; t += 3) {
          drift += (r() - 0.5) * 1.6;
          const z = z1 - t;
          pts.push(at(onFront ? [SOIL.x + start + drift, front, z] : [right, start + drift, z]));
        }
        out.push(k.fadeLineSvg(pts, { fade: [0, 14], tone: "lo", className: "soil-root" }));
      }
      out.push("</g>");
    }
  });
  return out.join("");
}

// Regla de profundidad apoyada en la esquina frontal del monolito.
function stick() {
  const out = [];
  out.push(S(k.slabOf(STICK, TRAY_H, SOIL_TOP + 3 - TRAY_H, P, 2, 0.3), { tone: "mid" }));
  const face = STICK.x + STICK.w;
  const edge = STICK.y; // arista de la silueta: los ticks nacen de una línea dibujada
  const minor = [];
  const major = [];
  const key = [];
  for (let cm = 0; cm <= SOIL_CM; cm++) {
    const z = zOf(cm);
    const big = cm % 5 === 0;
    const d = k.segment([face, edge, z], [face, edge + (big ? 3 : 1.6), z], P);
    (cm === 0 || cm === sampleDepth ? key : big ? major : minor).push(d);
  }
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }), L(key.join(""), { tone: "hi" }));
  return out.join("");
}

// ---------------------------------------------------------------- sonda (móvil)
// Franja de la ranura de la sonda en la cara que mira al espectador.
const SLOT_HALF = 0.78; // rad a cada lado del frente
const SLOT_Z = [SOIL_TOP + 4, SOIL_TOP + 4 + (DEPTH_MAX + 2) * CM];
function slotQuad(z0, z1) {
  const arc = (z, from, to) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const a = Math.atan2(VY, VX) + from + ((to - from) * i) / 8;
      pts.push(at([Math.cos(a) * PROBE_R, Math.sin(a) * PROBE_R, z]));
    }
    return pts;
  };
  const pts = [...arc(z0, -SLOT_HALF, SLOT_HALF), ...arc(z1, SLOT_HALF, -SLOT_HALF)];
  return "M" + pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("L") + "Z";
}

function probe() {
  const out = [];
  out.push(S(k.cylinder(0, 0, PROBE_R + 0.5, SOIL_TOP, 3.4, P, 40, 0.3), { tone: "hi", lit: true }));
  out.push(S(k.cylinder(0, 0, PROBE_R, SOIL_TOP + 3.4, PROBE_L - 3.4, P, 40), { tone: "hi", crease: "none", lit: true }));
  out.push(L(k.sideArc(0, 0, PROBE_R, SLOT_Z[1] + 10, P, 20), { tone: "faint" }));
  out.push(`<path class="probe-slot" d="${slotQuad(SLOT_Z[0], SLOT_Z[1])}"/>`);
  out.push(`<g data-part="core"></g>`);
  out.push(`<path class="iso-line" data-tone="lit" d="${slotQuad(SLOT_Z[0], SLOT_Z[1])}"/>`);
  return out.join("");
}

function rig() {
  const out = [];
  // Abrazadera, brazo y carro que bajan con la sonda por la cremallera.
  out.push(S(k.slabOf(CARRIAGE, CARRIAGE_Z[0], CARRIAGE_Z[1] - CARRIAGE_Z[0], P, 3, 0.6), { tone: "mid" }));
  out.push(L(k.sideSeam(CARRIAGE, CARRIAGE_Z[0] + 4, P, 3), { tone: "faint" }));
  out.push(D([at([CARRIAGE.x + CARRIAGE.w, -4, CARRIAGE_Z[1] - 4]), at([CARRIAGE.x + CARRIAGE.w, 4, CARRIAGE_Z[1] - 4])], { size: 0.45 }));
  const knob = [CARRIAGE.x + 3, 0];
  out.push(S(k.cylinder(knob[0], knob[1], 2, CARRIAGE_Z[1], 1.4, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(knob[0], knob[1], 3.6, CARRIAGE_Z[1] + 1.4, 4, P, 32), { tone: "mid" }));
  out.push(L(k.knurl(knob[0], knob[1], 3.6, CARRIAGE_Z[1] + 1.4, CARRIAGE_Z[1] + 5.4, 26, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([knob[0], knob[1]], [knob[0] + 3.2, knob[1]], CARRIAGE_Z[1] + 5.4, P), { tone: "hi", free: "end" }));
  out.push(D([at([knob[0], knob[1], CARRIAGE_Z[1] + 5.4])], { size: 0.45, tone: "hi" }));
  out.push(S(k.slabOf(ARM, ARM_Z[0], ARM_Z[1] - ARM_Z[0], P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([ARM.x + 6, 0, ARM_Z[1]]), at([ARM.x + ARM.w - 6, 0, ARM_Z[1]])], { size: 0.45 }));
  out.push(S(k.slabOf(CLAMP, CLAMP_Z[0], CLAMP_Z[1] - CLAMP_Z[0], P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([CLAMP.x + 2, CLAMP.y + 1.6, CLAMP_Z[1]]), at([CLAMP.x + 2, CLAMP.y + CLAMP.d - 1.6, CLAMP_Z[1]])], { size: 0.45 }));
  return out.join("");
}

function handle() {
  // Collar y manija en T de la sonda.
  const out = [];
  out.push(S(k.cylinder(0, 0, PROBE_R + 1, PROBE_TOP, 4, P, 40, 0.3), { tone: "hi", lit: true }));
  out.push(S(k.slabOf(HANDLE, HANDLE_Z, 3.6, P, 3, 0.4), { tone: "hi", lit: true }));
  for (const y of [HANDLE.y, HANDLE.y + HANDLE.d - 9]) {
    const grip = { x: -2.4, y, w: 4.8, d: 9, r: 2 };
    out.push(S(k.slabOf(grip, HANDLE_Z - 0.6, 4.8, P, 4, 0.4), { tone: "mid" }));
  }
  return out.join("");
}

// Agujero de muestreo en la superficie del horizonte O.
const HOLE_R = PROBE_R + 0.8;
const HOLE = k.ring(0, 0, HOLE_R, SOIL_TOP, P, 40);

// Recorte: la sonda sólo se dibuja por encima del borde cercano del agujero.
function clipPath() {
  const c = at([0, 0, SOIL_TOP]);
  const pts = [];
  const base = Math.atan2(VY, VX);
  for (let i = 0; i <= 24; i++) {
    const a = base - Math.PI / 2 + (Math.PI * i) / 24;
    pts.push(at([Math.cos(a) * HOLE_R, Math.sin(a) * HOLE_R, SOIL_TOP]));
  }
  pts.sort((p, q) => p[0] - q[0]);
  const left = pts[0];
  const right = pts[pts.length - 1];
  return `M${(left[0] - 30).toFixed(1)},${left[1].toFixed(1)}L${left[0].toFixed(1)},${left[1].toFixed(1)}L${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("L")}L${(right[0] + 30).toFixed(1)},${right[1].toFixed(1)}L${(right[0] + 30).toFixed(1)},${(c[1] - 2000).toFixed(1)}L${(left[0] - 30).toFixed(1)},${(c[1] - 2000).toFixed(1)}Z`;
}

const START = DEPTH_MIN;
const moveTo = (cm) => k.translateAlong(P, [0, 0, -cm * CM]);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  className: "soil-rig",
  label:
    "Un monolito de suelo en un marco de laboratorio, con sus horizontes O, A y B a la vista, y una columna de cremallera que baja una sonda de media caña hasta la profundidad elegida. Al sacarla, la ranura de la sonda muestra el núcleo de suelo que se llevó.",
  body: [
    base(),
    column(),
    backWalls(),
    soil(),
    stick(),
    `<path class="soil-hole" d="${HOLE}"/>`,
    `<clipPath id="soil-rig-above"><path d="${clipPath()}"/></clipPath>`,
    `<g data-move transform="${moveTo(START)}">${rig()}</g>`,
    `<g clip-path="url(#soil-rig-above)"><g data-move transform="${moveTo(START)}">${probe()}</g></g>`,
    `<g data-move transform="${moveTo(START)}">${handle()}</g>`,
  ],
});

// ---------------------------------------------------------------- en vivo
const live = `
const P = ${JSON.stringify(P)};
const CM = ${CM}, SOIL_TOP = ${SOIL_TOP}, MIN = ${DEPTH_MIN}, MAX = ${DEPTH_MAX}, SAMPLE = ${sampleDepth};
const SLOT_Z = ${JSON.stringify(SLOT_Z)}, SLOT_HALF = ${SLOT_HALF}, PROBE_R = ${PROBE_R};
const HORIZONS = ${JSON.stringify(SHOWN.map(({ id, from, to }) => ({ id, from, to })))};
const VIEW = Math.atan2(${VY}, ${VX});

function mount(stage) {
  const svg = stage.querySelector("svg");
  const movers = svg.querySelectorAll("[data-move]");
  const coreLayer = svg.querySelector('[data-part="core"]');
  const readout = stage.closest(".iso-figure").querySelector("[data-readout]");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const horizonAt = (cm) => HORIZONS.find((h) => cm >= h.from && cm < h.to) || HORIZONS[HORIZONS.length - 1];

  function band(z0, z1) {
    const pts = [];
    const arc = (z, a0, a1) => { for (let i = 0; i <= 8; i++) { const a = VIEW + a0 + ((a1 - a0) * i) / 8; pts.push(iso([Math.cos(a) * PROBE_R, Math.sin(a) * PROBE_R, z], P)); } };
    arc(z0, -SLOT_HALF, SLOT_HALF); arc(z1, SLOT_HALF, -SLOT_HALF);
    return "M" + pts.map((p) => p[0].toFixed(2) + "," + p[1].toFixed(2)).join("L") + "Z";
  }

  // El núcleo ocupa la ranura desde la punta: el suelo de la superficie queda arriba.
  let shown = "";
  function drawCore(core) {
    const key = core.toFixed(1);
    if (key === shown) return;
    shown = key;
    const parts = [];
    for (const h of HORIZONS) {
      const from = Math.max(h.from, 0), to = Math.min(h.to, core);
      if (to <= from) continue;
      const z0 = Math.max(SLOT_Z[0], SOIL_TOP + (core - to) * CM);
      const z1 = Math.min(SLOT_Z[1], SOIL_TOP + (core - from) * CM);
      if (z1 > z0) parts.push('<path class="probe-core soil-' + h.id.toLowerCase() + '" d="' + band(z0, z1) + '"/>');
    }
    coreLayer.innerHTML = parts.join("");
  }

  function say(depth, core) {
    let text;
    if (depth < 0) {
      if (core < 1) text = "Sonda fuera, lista para muestrear";
      else {
        const mixed = core > SAMPLE + 5;
        text = "Núcleo de " + Math.round(core) + " cm" + (mixed ? ", mezclado con subsuelo" : ", listo para la bolsa");
      }
    } else {
      const h = horizonAt(depth);
      text = Math.round(depth) + " cm, horizonte " + h.id + (depth > SAMPLE + 5 ? ": demasiado hondo" : "");
    }
    if (readout && readout.textContent !== text) readout.textContent = text;
    stage.setAttribute("aria-valuenow", String(Math.round(depth)));
    stage.setAttribute("aria-valuetext", text);
  }

  let depth = ${START}, target = depth, core = 0, inside = false;
  const tour = [[${DEPTH_MIN}, 1.2], [SAMPLE, 1.6], [${DEPTH_MIN}, 2.6], [32, 1.4], [${DEPTH_MIN}, 2.6]];
  let leg = 0, legClock = 0, touring = !still.matches, frame = 0, last = 0, visible = false, idle = 0;

  function draw() {
    const t = translateAlong(P, [0, 0, -depth * CM]);
    movers.forEach((el) => el.setAttribute("transform", t));
    // Al entrar al suelo se vacía la sonda; dentro, el núcleo crece con la profundidad máxima.
    if (depth > 0 && !inside) { inside = true; core = 0; }
    if (depth <= 0) inside = false;
    if (inside) core = Math.max(core, depth);
    drawCore(core);
    say(depth, core);
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (touring) {
      const [goal, dwell] = tour[leg];
      target = goal;
      if (Math.abs(depth - goal) < 0.15) { legClock += dt; if (legClock > dwell) { legClock = 0; leg = (leg + 1) % tour.length; } }
    }
    depth = still.matches ? target : depth + (target - depth) * (1 - Math.exp(-dt / 0.45));
    if (Math.abs(target - depth) < 0.01) depth = target;
    draw();
    const settled = !touring && depth === target;
    frame = visible && !settled ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
  const steer = (next) => {
    touring = false;
    target = clamp(next, MIN, MAX);
    clearTimeout(idle);
    idle = setTimeout(() => { touring = !still.matches; leg = 0; legClock = 0; run(); }, 5000);
    run();
  };
  new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); else if (frame) { cancelAnimationFrame(frame); frame = 0; } }, { rootMargin: "80px 0px" }).observe(stage);

  stage.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const box = svg.getBoundingClientRect();
    const share = clamp((event.clientY - box.top) / box.height, 0, 1);
    steer(MIN + clamp((share - 0.12) / 0.7, 0, 1) * (MAX - MIN));
  });
  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    steer(target < SAMPLE / 2 ? SAMPLE : MIN);
  });
  stage.addEventListener("keydown", (event) => {
    let to = null;
    if (event.key === "ArrowDown") to = Math.round(target) + 1;
    if (event.key === "ArrowUp") to = Math.round(target) - 1;
    if (event.key === "PageDown") to = Math.round(target) + 5;
    if (event.key === "PageUp") to = Math.round(target) - 5;
    if (event.key === "Home") to = MIN;
    if (event.key === "End") to = MAX;
    if (event.key === "Enter" || event.key === " ") to = target < SAMPLE / 2 ? SAMPLE : MIN;
    if (to === null) return;
    event.preventDefault();
    steer(to);
  });
  const hint = stage.closest(".iso-figure").querySelector('[data-corner="hint"]');
  if (hint && matchMedia("(hover: none) and (pointer: coarse)").matches) hint.textContent = "Toca para tomar una muestra";
  if (still.matches) { depth = target = MIN; core = SAMPLE; }
  draw();
}

document.querySelectorAll(".soil-rig-stage").forEach(mount);
`;

const plate = k.plateHtml({
  fig: "Fig. 1",
  title: "Sonda en un monolito de suelo",
  hint: "Mueve el cursor sobre la sonda",
  readout: "Sonda fuera, lista para muestrear",
  keys: [
    { mark: "lit", label: "La sonda y el núcleo que saca" },
    { mark: "raised", label: `Horizontes O, A y B, con su color Munsell` },
  ],
  caption: `Para tu análisis se muestrean los primeros ${sampleDepth} cm, la capa donde trabaja la raíz. Si la sonda baja más, el núcleo arrastra subsuelo y el resultado ya no describe tu capa arable.`,
  body: `<div class="iso-stage soil-rig-stage" tabindex="0" role="slider" aria-label="Profundidad de la sonda: flechas arriba y abajo para moverla, Enter para tomar una muestra" aria-valuemin="${DEPTH_MIN}" aria-valuemax="${DEPTH_MAX}" aria-valuenow="${DEPTH_MIN}">${svg}</div>`,
});

const kitSource = readFileSync(join(HERE, "kit", "iso-kit.mjs"), "utf8").replace(/^export /gm, "");
writeFileSync(join(ROOT, "src/generated/soil-rig.html"), plate);
writeFileSync(join(ROOT, "src/generated/soil-rig-live.js"), `// Generado por figure/build.mjs. No editar a mano.\n${kitSource}\n${live}`);
console.log("figure: wrote src/generated/soil-rig.html and soil-rig-live.js");

if (process.argv.includes("--preview")) {
  const css = readFileSync(join(ROOT, "src/styles/soil-rig.css"), "utf8");
  const page = k.pageHtml({ title: "Sonda de muestreo", theme: "light", body: plate, script: kitSource + live, width: 520 }).replace("</style>", `${css}</style>`);
  writeFileSync(join(HERE, "preview.html"), page);
  console.log("figure: wrote figure/preview.html");
}
