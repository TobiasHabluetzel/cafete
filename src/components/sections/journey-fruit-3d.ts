import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * The in-focus fruit of the Fruity scene as real 3D, in the style of a drinks commercial:
 * not real, but perfect. Each fruit has what makes real fruit read as real — a crown or stem,
 * a slightly uneven shape, fine pores, colour that shifts across the skin and a soft sheen
 * rather than lacquer. Elderberries carry the dusty bloom that berries have.
 *
 * Loaded only when the scene is used, and only where WebGL works; otherwise the drawn images
 * stay. The blurred fruit in front of and behind the word stay images, because blur hides
 * that they are flat and they cost nothing.
 */

export type Fruit3DKind = "cherry" | "cran" | "elder" | "slice";

/** Where one fruit is this frame, in pixels from the scene's centre point. */
export interface FruitPose {
  x: number;
  y: number;
  /** Rendered width in pixels. */
  size: number;
  scale: number;
  opacity: number;
}

export interface Fruit3D {
  /** Hands over the latest poses; `active` says whether the Fruity scene is on screen. */
  update(poses: Map<number, FruitPose>, progress: number, active: boolean): void;
  resize(): void;
  dispose(): void;
}

interface Piece {
  group: THREE.Group;
  materials: THREE.MeshPhysicalMaterial[];
  kind: Fruit3DKind;
  spin: number;
  seed: number;
}

/* ---------------------------------------------------------------------------
   Procedural textures. Small, generated once, shared by every fruit of a kind.
--------------------------------------------------------------------------- */

function random(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** Fractal value noise, wrapping horizontally so the seam of a sphere does not show. */
function noise(w: number, h: number, cells: number, octaves: number, seed: number) {
  const out = new Float32Array(w * h);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const gw = cells << o;
    const gh = Math.max(2, Math.round((gw * h) / w));
    const r = random(seed + o * 101);
    const grid = new Float32Array(gw * (gh + 1));
    for (let i = 0; i < grid.length; i++) grid[i] = r();
    for (let y = 0; y < h; y++) {
      const gy = (y / h) * gh;
      const y0 = Math.floor(gy);
      const fy = gy - y0;
      const sy = fy * fy * (3 - 2 * fy);
      for (let x = 0; x < w; x++) {
        const gx = (x / w) * gw;
        const x0 = Math.floor(gx) % gw;
        const x1 = (x0 + 1) % gw;
        const fx = gx - Math.floor(gx);
        const sx = fx * fx * (3 - 2 * fx);
        const a = grid[y0 * gw + x0] + (grid[y0 * gw + x1] - grid[y0 * gw + x0]) * sx;
        const b = grid[(y0 + 1) * gw + x0] + (grid[(y0 + 1) * gw + x1] - grid[(y0 + 1) * gw + x0]) * sx;
        out[y * w + x] += (a + (b - a) * sy) * amp;
      }
    }
    total += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

type Paint = (u: number, v: number, i: number) => [number, number, number];

function paint(w: number, h: number, fn: Paint, color: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const [r, gg, b] = fn(x / w, y / h, i);
      img.data[i * 4] = r;
      img.data[i * 4 + 1] = gg;
      img.data[i * 4 + 2] = b;
      img.data[i * 4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

const mix = (a: number[], b: number[], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function textures() {
  const W = 512;
  const H = 256;
  const broad = noise(W, H, 6, 3, 11);
  const fine = noise(W, H, 48, 3, 23);
  const pores = noise(W, H, 160, 2, 37);

  // Coffee cherry: rows run from the stem (top) to the blossom end (bottom).
  const cherryColor = paint(W, H, (_u, v, i) => {
    let c = mix([214, 10, 18], [176, 0, 12], broad[i]);
    c = mix(c, [226, 74, 22], clamp01((0.16 - v) / 0.16) * 0.55); // warmer near the stem
    c = mix(c, [92, 8, 10], clamp01((v - 0.86) / 0.14) * 0.8); // darker round the crown
    return mix(c, [255, 70, 60], Math.max(0, fine[i] - 0.62) * 0.9);
  }, true);

  // Cranberry: mottled — deep crimson with lighter patches and pale pores.
  const cranColor = paint(W, H, (_u, v, i) => {
    let c = mix([150, 0, 30], [214, 12, 46], broad[i]);
    c = mix(c, [255, 92, 106], clamp01((fine[i] - 0.55) * 2.2) * 0.55);
    c = mix(c, [110, 0, 26], clamp01((0.12 - v) / 0.12) * 0.7);
    if (pores[i] > 0.86) c = mix(c, [255, 200, 205], 0.55);
    return c;
  }, true);

  // Elderberry: purple-black with a slightly lighter, uneven shimmer.
  const elderColor = paint(W, H, (_u, _v, i) => mix([26, 6, 40], [70, 22, 92], broad[i] * 0.8 + fine[i] * 0.2), true);

  const bump = paint(W, H, (_u, _v, i) => {
    const n = 128 + (pores[i] - 0.5) * 150 + (fine[i] - 0.5) * 60;
    return [n, n, n];
  }, false);

  return { cherryColor, cranColor, elderColor, bump };
}

/** The lemon face, painted once onto a canvas and used as the slice's top and bottom. */
function lemonFace(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d")!;
  const c = size / 2;
  const ring = (r: number, fill: string | CanvasGradient) => {
    g.beginPath();
    g.arc(c, c, r, 0, Math.PI * 2);
    g.fillStyle = fill;
    g.fill();
  };
  const rind = g.createRadialGradient(c * 0.8, c * 0.7, 10, c, c, c);
  rind.addColorStop(0, "#fff35a");
  rind.addColorStop(1, "#ffd200");
  ring(c, rind);
  ring(c * 0.9, "#fffbe6");
  ring(c * 0.84, "#fff6c8");
  const flesh = g.createRadialGradient(c, c, 0, c, c, c * 0.82);
  flesh.addColorStop(0, "#fffbc8");
  flesh.addColorStop(0.5, "#fff044");
  flesh.addColorStop(1, "#ffdc00");
  for (let i = 0; i < 10; i++) {
    const a0 = ((i * 36 + 4.5) * Math.PI) / 180;
    const a1 = (((i + 1) * 36 - 4.5) * Math.PI) / 180;
    const mid = (a0 + a1) / 2;
    g.beginPath();
    g.moveTo(c + Math.cos(mid) * c * 0.1, c + Math.sin(mid) * c * 0.1);
    g.arc(c, c, c * 0.8, a0, a1);
    g.closePath();
    g.fillStyle = flesh;
    g.fill();
    const dome = g.createRadialGradient(
      c + Math.cos(mid) * c * 0.5 - 12,
      c + Math.sin(mid) * c * 0.5 - 12,
      2,
      c + Math.cos(mid) * c * 0.5,
      c + Math.sin(mid) * c * 0.5,
      c * 0.3,
    );
    dome.addColorStop(0, "rgba(255,255,255,0.5)");
    dome.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = dome;
    g.fill();
  }
  ring(c * 0.08, "#fff8e2");
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  // Juice cells: fine streaks running outwards from the centre.
  const cells = noise(size, size, 90, 2, 53);
  const bump = paint(size, size, (u, v, i) => {
    const dx = u - 0.5;
    const dy = v - 0.5;
    const streak = Math.sin(Math.atan2(dy, dx) * 120) * 0.5 + 0.5;
    const n = 128 + (cells[i] - 0.5) * 120 + (streak - 0.5) * 50;
    return [n, n, n];
  }, false);
  return { map, bump };
}

/** A sphere with gentle lumps, so no two read as machine-made. */
function lumpy(seed: number, amount: number) {
  const geometry = new THREE.SphereGeometry(0.5, 64, 40);
  const p = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n =
      Math.sin(v.x * 7 + seed) * 0.5 + Math.sin(v.y * 9 + seed * 1.7) * 0.3 + Math.sin(v.z * 8 + seed * 2.3) * 0.2;
    v.multiplyScalar(1 + n * amount);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function skin(params: THREE.MeshPhysicalMaterialParameters) {
  return new THREE.MeshPhysicalMaterial({ metalness: 0, transparent: true, ...params });
}

type Shared = ReturnType<typeof textures> & {
  face: ReturnType<typeof lemonFace>;
  cherryBody: THREE.SphereGeometry;
  cranBody: THREE.SphereGeometry;
  berryBody: THREE.SphereGeometry;
  small: THREE.SphereGeometry;
  sliceBody: THREE.CylinderGeometry;
  sepal: THREE.ConeGeometry;
  ring: THREE.TorusGeometry;
};

function build(kind: Fruit3DKind, s: Shared) {
  const group = new THREE.Group();
  const materials: THREE.MeshPhysicalMaterial[] = [];
  const add = (geometry: THREE.BufferGeometry, material: THREE.MeshPhysicalMaterial | THREE.MeshPhysicalMaterial[]) => {
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    for (const m of Array.isArray(material) ? material : [material]) materials.push(m);
    return mesh;
  };
  const dark = (color: string) => skin({ color, roughness: 0.75 });

  if (kind === "slice") {
    const side = skin({ color: "#ffd400", roughness: 0.45, bumpMap: s.bump, bumpScale: 1.5, emissive: "#6a5200", emissiveIntensity: 0.5 });
    const top = skin({
      color: "#ffffff",
      map: s.face.map,
      emissiveMap: s.face.map,
      emissive: "#ffffff",
      emissiveIntensity: 0.7,
      bumpMap: s.face.bump,
      bumpScale: 2,
      roughness: 0.22,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
    });
    add(s.sliceBody, [side, top, top]);
    return { group, materials };
  }

  if (kind === "cherry") {
    // The sphere's poles lie along x: stem on the left, blossom crown on the right.
    add(
      s.cherryBody,
      skin({
        map: s.cherryColor,
        bumpMap: s.bump,
        bumpScale: 1.2,
        roughness: 0.3,
        clearcoat: 0.55,
        clearcoatRoughness: 0.14,
        sheen: 0.35,
        sheenColor: "#ff5a3a",
        emissive: "#4a0004",
        emissiveIntensity: 0.35,
      }),
    ).scale.set(1, 0.82, 0.82);
    const stem = add(new THREE.CylinderGeometry(0.03, 0.045, 0.07, 10), dark("#4a3a16"));
    stem.rotation.z = Math.PI / 2;
    stem.position.x = -0.52;
    const crown = add(s.ring, dark("#3a1208"));
    crown.rotation.y = Math.PI / 2;
    crown.position.x = 0.485;
    crown.scale.setScalar(0.85);
    const hollow = add(s.small, dark("#1c0604"));
    hollow.scale.set(0.02, 0.06, 0.06);
    hollow.position.x = 0.49;
    return { group, materials };
  }

  const isCran = kind === "cran";
  add(
    isCran ? s.cranBody : s.berryBody,
    isCran
      ? skin({
          map: s.cranColor,
          bumpMap: s.bump,
          bumpScale: 0.8,
          roughness: 0.24,
          clearcoat: 0.7,
          clearcoatRoughness: 0.1,
          emissive: "#3a000c",
          emissiveIntensity: 0.35,
        })
      : skin({
          // The dusty bloom of a berry: sheen in a pale blue-grey over a deep purple.
          map: s.elderColor,
          bumpMap: s.bump,
          bumpScale: 0.6,
          roughness: 0.42,
          sheen: 1,
          sheenColor: "#8a94c4",
          sheenRoughness: 0.55,
          clearcoat: 0.25,
          clearcoatRoughness: 0.3,
          emissive: "#12041c",
          emissiveIntensity: 0.4,
        }),
  ).scale.set(1, isCran ? 1.05 : 1, 1);
  // Crown at the top: a dark centre with small pointed sepals.
  const top = isCran ? 0.52 : 0.49;
  const centre = add(s.small, dark(isCran ? "#3a0612" : "#120408"));
  centre.scale.set(0.09, 0.02, 0.09);
  centre.position.y = top;
  const count = isCran ? 4 : 5;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const sepal = add(s.sepal, dark(isCran ? "#5a1a1a" : "#2a1020"));
    sepal.position.set(Math.cos(a) * 0.06, top - 0.005, Math.sin(a) * 0.06);
    sepal.rotation.set(0, -a, -Math.PI / 2 + 0.25);
    sepal.scale.setScalar(isCran ? 1 : 0.9);
  }
  return { group, materials };
}

export function createFruit3D(
  host: HTMLElement,
  origin: HTMLElement,
  fruit: { index: number; kind: Fruit3DKind; spin: number }[],
): Fruit3D | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  const phone = window.matchMedia("(max-width: 767px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.75 : 2));
  // Neutral keeps the reds saturated; filmic curves pushed them towards salmon.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = "journey-fruit3d";
  // Right after the sharp image layer, so it keeps that layer's place between word and bottle.
  origin.after(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  // A soft studio, kept low: strong grey reflections made the fruit look milky.
  scene.environmentIntensity = 0.4;
  room.dispose();
  // Soft warm key from the top left, a sunset rim from behind, a small spark for the highlight.
  const key = new THREE.DirectionalLight("#fff4e6", 2.8);
  key.position.set(-1, 1.3, 1.4);
  const rim = new THREE.DirectionalLight("#ff7a2a", 3);
  rim.position.set(1.4, -0.4, -1);
  const spark = new THREE.PointLight("#ffffff", 2, 0, 0);
  spark.position.set(-400, 500, 900);
  scene.add(key, rim, spark, new THREE.HemisphereLight("#ffd8c4", "#3a0808", 0.4));

  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
  const cherryBody = lumpy(3, 0.025);
  cherryBody.rotateZ(Math.PI / 2);
  const shared: Shared = {
    ...textures(),
    face: lemonFace(),
    cherryBody,
    cranBody: lumpy(7, 0.03),
    berryBody: lumpy(13, 0.015),
    small: new THREE.SphereGeometry(0.5, 16, 12),
    sliceBody: new THREE.CylinderGeometry(0.5, 0.5, 0.11, 72),
    sepal: new THREE.ConeGeometry(0.022, 0.07, 5),
    ring: new THREE.TorusGeometry(0.075, 0.022, 10, 24),
  };

  const pieces = new Map<number, Piece>();
  for (const f of fruit) {
    const { group, materials } = build(f.kind, shared);
    group.visible = false;
    scene.add(group);
    pieces.set(f.index, { group, materials, kind: f.kind, spin: f.spin, seed: (f.index * 0.618034) % 1 });
  }

  let width = 1;
  let height = 1;
  let centre = { x: 0, y: 0 };
  const resize = () => {
    width = host.clientWidth || 1;
    height = host.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // At this distance one world unit is one CSS pixel on the plane z = 0.
    camera.position.z = height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    camera.updateProjectionMatrix();
    const box = host.getBoundingClientRect();
    const point = origin.getBoundingClientRect();
    centre = { x: point.left - box.left, y: point.top - box.top };
  };
  resize();

  let poses = new Map<number, FruitPose>();
  let progress = 0;
  let active = false;
  let frame = 0;
  let last = performance.now();
  let clock = 0;

  const draw = (now: number) => {
    frame = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    for (const [index, piece] of pieces) {
      const pose = poses.get(index);
      const g = piece.group;
      if (!pose || pose.opacity < 0.01) {
        g.visible = false;
        continue;
      }
      g.visible = true;
      g.position.set(centre.x + pose.x - width / 2, -(centre.y + pose.y - height / 2), 0);
      g.scale.setScalar(pose.size * pose.scale);
      const t = clock + piece.seed * 10;
      const s = piece.spin;
      if (piece.kind === "slice") {
        // Keeps its face towards the viewer while it wobbles and turns.
        g.rotation.set(1.05 + 0.3 * Math.sin(t * 0.7), 0.4 * Math.sin(t * 0.5), s * (t * 0.35 + progress * 3));
      } else if (piece.kind === "cherry") {
        g.rotation.set(0.5 * Math.sin(t * 0.6), 0.7 * Math.sin(t * 0.45) + progress * 2 * s, s * (0.3 + t * 0.25));
      } else {
        // Berries tip forward now and then, so the crown shows.
        g.rotation.set(0.6 + 0.7 * Math.sin(t * 0.5) + progress * 2 * s, t * 0.4 * s, 0.4 * Math.sin(t * 0.3));
      }
      for (const m of piece.materials) m.opacity = pose.opacity;
    }
    renderer.render(scene, camera);
    if (active) frame = requestAnimationFrame(draw);
  };

  return {
    update(next, p, on) {
      poses = next;
      progress = p;
      active = on;
      renderer.domElement.style.display = on ? "block" : "none";
      if (on && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    },
    resize,
    dispose() {
      cancelAnimationFrame(frame);
      for (const piece of pieces.values()) for (const m of piece.materials) m.dispose();
      for (const value of Object.values(shared)) {
        if (value instanceof THREE.BufferGeometry || value instanceof THREE.Texture) value.dispose();
      }
      shared.face.map.dispose();
      shared.face.bump.dispose();
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
