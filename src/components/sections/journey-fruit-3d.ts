import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * The in-focus fruit of the Fruity scene as real 3D: glossy, lacquered, a little too perfect,
 * like the fruit in a drinks commercial. Loaded only when the scene is used, and only where
 * WebGL works; otherwise the drawn images stay. The blurred fruit in front of and behind the
 * word stay images, because blur hides that they are flat and they cost nothing.
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

/** The lemon face, painted once onto a canvas and used as the slice's top and bottom. */
function lemonFace(): THREE.CanvasTexture {
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
    // A soft highlight on each segment, so they read as juicy and domed.
    const dome = g.createRadialGradient(
      c + Math.cos(mid) * c * 0.5 - 12,
      c + Math.sin(mid) * c * 0.5 - 12,
      2,
      c + Math.cos(mid) * c * 0.5,
      c + Math.sin(mid) * c * 0.5,
      c * 0.3,
    );
    dome.addColorStop(0, "rgba(255,255,255,0.55)");
    dome.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = dome;
    g.fill();
  }
  ring(c * 0.08, "#fff8e2");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function lacquer(color: string, extra: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.2,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 0.65,
    transparent: true,
    ...extra,
  });
}

function build(kind: Fruit3DKind, sphere: THREE.SphereGeometry, slice: THREE.CylinderGeometry, face: THREE.Texture) {
  const group = new THREE.Group();
  const materials: THREE.MeshPhysicalMaterial[] = [];
  const add = (geometry: THREE.BufferGeometry, material: THREE.MeshPhysicalMaterial | THREE.MeshPhysicalMaterial[]) => {
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    for (const m of Array.isArray(material) ? material : [material]) materials.push(m);
    return mesh;
  };

  if (kind === "slice") {
    const side = lacquer("#ffd800", { roughness: 0.35, clearcoat: 0.5, emissive: "#7a6400", emissiveIntensity: 0.6 });
    const top = lacquer("#ffffff", { map: face, emissiveMap: face, emissive: "#ffffff", emissiveIntensity: 0.85, roughness: 0.3, clearcoat: 0.35 });
    add(slice, [side, top, top]);
    return { group, materials };
  }

  if (kind === "cherry") {
    const body = add(sphere, lacquer("#c2000a", { emissive: "#6a0006", emissiveIntensity: 0.5 }));
    body.scale.set(1, 0.82, 0.82);
    const stem = add(new THREE.CylinderGeometry(0.035, 0.05, 0.08, 12), lacquer("#4a3a14", { roughness: 0.7, clearcoat: 0 }));
    stem.rotation.z = Math.PI / 2;
    stem.position.x = -0.52;
    const navel = add(sphere, lacquer("#3a0c08", { roughness: 0.7, clearcoat: 0 }));
    navel.scale.set(0.04, 0.12, 0.12);
    navel.position.x = 0.49;
    return { group, materials };
  }

  const isCran = kind === "cran";
  const body = add(
    sphere,
    isCran
      ? lacquer("#b8001f", { emissive: "#5c0012", emissiveIntensity: 0.5 })
      : lacquer("#3a0a52", { emissive: "#1a0426", emissiveIntensity: 0.5, roughness: 0.16 }),
  );
  if (isCran) body.scale.set(1, 1.05, 1);
  const navel = add(sphere, lacquer(isCran ? "#40081a" : "#14060c", { roughness: 0.7, clearcoat: 0 }));
  navel.scale.set(isCran ? 0.16 : 0.2, 0.04, isCran ? 0.16 : 0.2);
  navel.position.y = isCran ? 0.52 : 0.49;
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
  // Only a hint of the studio: broad grey reflections made the fruit look milky. The crisp
  // highlights come from the lights below.
  scene.environmentIntensity = 0.3;
  room.dispose();
  // Warm key light from the top left, as on the bottle, and a sunset rim from behind.
  const key = new THREE.DirectionalLight("#fff4e6", 3.2);
  key.position.set(-1, 1.3, 1.4);
  const rim = new THREE.DirectionalLight("#ff7a2a", 3);
  rim.position.set(1.4, -0.4, -1);
  const spark = new THREE.PointLight("#ffffff", 2.5, 0, 0);
  spark.position.set(-400, 500, 900);
  scene.add(key, rim, spark, new THREE.HemisphereLight("#ffd8c4", "#3a0808", 0.35));

  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
  const sphere = new THREE.SphereGeometry(0.5, 48, 32);
  const sliceGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.11, 64);
  const face = lemonFace();

  const pieces = new Map<number, Piece>();
  for (const f of fruit) {
    const { group, materials } = build(f.kind, sphere, sliceGeometry, face);
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
        g.rotation.set(t * 0.5 * s + progress * 4, t * 0.4, t * 0.2 * s);
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
      sphere.dispose();
      sliceGeometry.dispose();
      face.dispose();
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
