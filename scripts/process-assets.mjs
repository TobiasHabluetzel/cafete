/**
 * Turn the designer's source files into web assets in `public/`.
 *
 *   node scripts/process-assets.mjs [sourceDir]
 *
 * The logo, slogan banner and cherry illustration are all delivered on a flat
 * orange background. We key that out so they can sit on dark sections too.
 *
 * Keying is a border flood fill rather than a global colour match: the artwork
 * itself contains orange (the sunburst, the leaves), and a global match would
 * punch holes straight through it. Only background-connected pixels go.
 *
 * Re-run this whenever the designer sends updated files.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = process.argv[2] ?? "/Users/tobiashablutzel/Desktop/Cafeete";
const OUT_DIR = path.join(import.meta.dirname, "..", "public");

/** Squared RGB distance — avoids a sqrt per pixel. */
function dist2(data, i, [r, g, b]) {
  const dr = data[i] - r;
  const dg = data[i + 1] - g;
  const db = data[i + 2] - b;
  return dr * dr + dg * dg + db * db;
}

/**
 * Flood fill inward from every border pixel, clearing alpha on anything within
 * `tol` of the background colour. Edge pixels between `tol` and `feather` get
 * partial alpha so anti-aliased outlines don't turn into a hard orange halo.
 */
function keyBackground(data, width, height, channels, bg, tol = 42, feather = 78) {
  const tol2 = tol * tol;
  const feather2 = feather * feather;
  const n = width * height;
  const cleared = new Uint8Array(n);
  const stack = [];

  const push = (x, y) => {
    const p = y * width + x;
    if (cleared[p]) return;
    if (dist2(data, p * channels, bg) > tol2) return;
    cleared[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length) {
    const p = stack.pop();
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  // Feather: any surviving pixel touching a cleared one gets alpha scaled by how
  // far it is from the background colour.
  const alpha = new Uint8Array(n).fill(255);
  for (let p = 0; p < n; p++) if (cleared[p]) alpha[p] = 0;

  for (let p = 0; p < n; p++) {
    if (cleared[p]) continue;
    const x = p % width;
    const y = (p - x) / width;
    const touchesCleared =
      (x > 0 && cleared[p - 1]) ||
      (x < width - 1 && cleared[p + 1]) ||
      (y > 0 && cleared[p - width]) ||
      (y < height - 1 && cleared[p + width]);
    if (!touchesCleared) continue;

    const d2 = dist2(data, p * channels, bg);
    if (d2 >= feather2) continue;
    alpha[p] = Math.round(255 * Math.sqrt(d2 / feather2));
  }

  let clearedCount = 0;
  for (let p = 0; p < n; p++) {
    data[p * channels + 3] = alpha[p];
    if (alpha[p] === 0) clearedCount++;
  }
  return clearedCount / n;
}

/**
 * Key for artwork that is a single ink colour on a single flat background — the
 * slogan banner is pure black on pure orange. Project each pixel onto the
 * ink→background axis and use its position as alpha, then force the colour to
 * the ink. Unlike a flood fill this reconstructs anti-aliased edges exactly, so
 * no orange fringe survives the downscale.
 */
function axisKey(data, width, height, channels, ink, bg) {
  const axis = [bg[0] - ink[0], bg[1] - ink[1], bg[2] - ink[2]];
  const axisLen2 = axis[0] ** 2 + axis[1] ** 2 + axis[2] ** 2;

  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    const v = [data[i] - ink[0], data[i + 1] - ink[1], data[i + 2] - ink[2]];
    // t = 0 at ink, 1 at background.
    let t = (v[0] * axis[0] + v[1] * axis[1] + v[2] * axis[2]) / axisLen2;
    t = Math.min(1, Math.max(0, t));
    data[i] = ink[0];
    data[i + 1] = ink[1];
    data[i + 2] = ink[2];
    data[i + 3] = Math.round(255 * (1 - t));
  }
}

async function inkCutout({ src, out, resizeWidth, ink = [0, 0, 0] }) {
  let pipeline = sharp(src).ensureAlpha();
  if (resizeWidth) pipeline = pipeline.resize({ width: resizeWidth, withoutEnlargement: true });

  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  const bg = [data[0], data[1], data[2]];

  axisKey(data, info.width, info.height, info.channels, ink, bg);

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png({ compressionLevel: 9 })
    .trim({ threshold: 1 })
    .toFile(path.join(OUT_DIR, out));

  const meta = await sharp(path.join(OUT_DIR, out)).metadata();
  console.log(
    `  ${out.padEnd(34)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)}` +
      ` ink=rgb(${ink}) bg=rgb(${bg})`,
  );
}

/** Straight re-encode: artwork whose background is part of the design. */
async function asDesigned({ src, out, resizeWidth }) {
  let pipeline = sharp(src);
  if (resizeWidth) pipeline = pipeline.resize({ width: resizeWidth, withoutEnlargement: true });
  await pipeline.png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, out));
  const meta = await sharp(path.join(OUT_DIR, out)).metadata();
  console.log(
    `  ${out.padEnd(34)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)} (background kept)`,
  );
}

async function cutout({ src, out, resizeWidth, tol, feather }) {
  let pipeline = sharp(src).ensureAlpha();
  if (resizeWidth) pipeline = pipeline.resize({ width: resizeWidth, withoutEnlargement: true });

  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  const bg = [data[0], data[1], data[2]];

  const clearedRatio = keyBackground(
    data,
    info.width,
    info.height,
    info.channels,
    bg,
    tol,
    feather,
  );

  // Trim the now-transparent margin so the asset has no dead space around it.
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png({ compressionLevel: 9 })
    .trim({ threshold: 1 })
    .toFile(path.join(OUT_DIR, out));

  const meta = await sharp(path.join(OUT_DIR, out)).metadata();
  console.log(
    `  ${out.padEnd(34)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)}` +
      ` bg=rgb(${bg}) cleared=${(clearedRatio * 100).toFixed(1)}%`,
  );
}

async function photo({ src, out, width, quality = 82 }) {
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(path.join(OUT_DIR, out));
  const meta = await sharp(path.join(OUT_DIR, out)).metadata();
  console.log(`  ${out.padEnd(34)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)}`);
}

const s = (name) => {
  const full = path.join(SOURCE_DIR, name);
  if (!existsSync(full)) throw new Error(`Missing source asset: ${full}`);
  return full;
};

console.log(`Processing brand assets from ${SOURCE_DIR}\n`);

// The logo keeps its orange background on purpose. The orange is structural —
// it forms the ring between the red circle and the red rays, and it is the same
// continuous region as the outer background, so no fill can separate them.
// Keying it leaves a hole where the ring should be. We present it as a sticker.
console.log("As designed (background is part of the artwork):");
await asDesigned({ src: s("Cafété Logo satt.png"), out: "logo-cafete.png" });

// Pure black bubble lettering on flat orange → black on transparent, so it can
// be laid on our own orange band at any height.
console.log("\nInk cutout (exact anti-aliased edges):");
await inkCutout({
  src: s("Slogan Orange Schwarz optimiert mit Lineal.png"),
  out: "banner-slogan.png",
  resizeWidth: 2400,
});

// The cherry illustration's orange background is not structural — the leaves
// read fine against anything — so a border flood fill is right here.
console.log("\nFlood-fill cutout:");
await cutout({
  src: s("Kaffeekirsche.png"),
  out: "coffee-cherry-illustration.png",
  tol: 30,
  feather: 60,
});

console.log("\nPhotography:");
await photo({
  src: s("Kaffeekirsche für Post.png"),
  out: "coffee-cherry-photo.jpg",
  width: 1733,
  quality: 84,
});
await photo({
  src: s("Cafété Mockup.png"),
  out: "bottle-photo.jpg",
  width: 1086,
  quality: 86,
});

console.log("\nDone.");
