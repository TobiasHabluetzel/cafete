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
function keyBackground(data, width, height, channels, bg, tol = 42, feather = 78, globalClear = false) {
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

  /*
   * `globalClear` also clears background-coloured pixels the border fill could
   * not reach — speckles of scanner noise enclosed by the artwork. Only safe when
   * the artwork itself contains nothing near the background colour: true for the
   * falling-cascara hand (orange hand, dark red fruit), false for the jar, whose
   * glass is drawn in white and would be punched full of holes.
   */
  if (globalClear) {
    for (let p = 0; p < n; p++) {
      if (alpha[p] === 0) continue;
      if (dist2(data, p * channels, bg) <= tol * tol) alpha[p] = 0;
    }
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
  if (missing(src, out)) return;
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

/*
 * There used to be a `transparentArt()` helper here for sources that already had
 * an alpha channel — just trim and re-encode. Its only caller was the old bottle
 * mockup, now replaced by a keyed studio shot, so it went with it. Recover it
 * from git history if a delivery ever arrives pre-cut again.
 */

/** Straight re-encode: artwork whose background is part of the design. */
async function asDesigned({ src, out, resizeWidth }) {
  if (missing(src, out)) return;
  let pipeline = sharp(src);
  if (resizeWidth) pipeline = pipeline.resize({ width: resizeWidth, withoutEnlargement: true });
  await pipeline.png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, out));
  const meta = await sharp(path.join(OUT_DIR, out)).metadata();
  console.log(
    `  ${out.padEnd(34)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)} (background kept)`,
  );
}

async function cutout({ src, out, resizeWidth, tol, feather, globalClear }) {
  if (missing(src, out)) return;
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
    globalClear,
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

/**
 * `region` optionally pre-crops the source, as fractions of its dimensions, so
 * subjects photographed at different distances can be framed consistently.
 */
async function photo({ src, out, width, height, position, region, quality = 82 }) {
  if (missing(src, out)) return;
  let pipeline = sharp(src).rotate(); // honour EXIF orientation before cropping

  if (region) {
    const meta = await sharp(src).rotate().metadata();
    pipeline = pipeline.extract({
      left: Math.round(region.left * meta.width),
      top: Math.round(region.top * meta.height),
      width: Math.round(region.width * meta.width),
      height: Math.round(region.height * meta.height),
    });
  }

  await pipeline
    .resize({
      width,
      height,
      position,
      fit: height ? "cover" : "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality, mozjpeg: true })
    .toFile(path.join(OUT_DIR, out));

  const meta = await sharp(path.join(OUT_DIR, out)).metadata();
  console.log(`  ${out.padEnd(34)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)}`);
}

/** Extra places to look — the founder photos arrived straight into Downloads. */
const EXTRA_DIRS = [path.join(process.env.HOME ?? "", "Downloads")];

const skipped = [];

/**
 * Resolve a source file, accepting any of several candidate filenames.
 *
 * Returns `null` rather than throwing when nothing matches, and the four
 * processing helpers no-op on a null source. The sources arrive from the owner a
 * few at a time and get tidied off the desktop afterwards, so on any given day
 * some are missing — and one absent file must not stop the rest of `public/`
 * from being regenerated. Every skip is listed at the end so a typo in a
 * filename still gets noticed.
 */
const s = (...names) => {
  for (const dir of [SOURCE_DIR, ...EXTRA_DIRS]) {
    for (const name of names) {
      const full = path.join(dir, name);
      if (existsSync(full)) return full;
    }
  }
  skipped.push(names[0]);
  return null;
};

/** True when there is no source to work from — the caller should return early. */
function missing(src, out) {
  if (src) return false;
  console.log(`  ${out.padEnd(34)} skipped — no source`);
  return true;
}

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

// Delivered on an off-white, slightly noisy background (~#FBFBFB varying to
// #F3F3F1) rather than transparent, so they need the same border flood fill.
await cutout({
  src: s("1 Handvoll Cascara.png"),
  out: "cascara-jar-hand.png",
  resizeWidth: 1180,
  tol: 26,
  feather: 55,
});
await cutout({
  src: s("Cascara fallend.png"),
  out: "cascara-falling.png",
  resizeWidth: 1400,
  tol: 30,
  feather: 55,
  // Safe here: nothing in this drawing is near-white, so the leftover speckles
  // that showed against the dark sections can all go.
  globalClear: true,
});

/*
 * Pack shots for the shop cards: 6, 12 and 24 bottles.
 *
 * Shot on pure black, so the same border flood fill applies. tol 30 is enough —
 * verified against tol 55, which cleared only 0.5% more and risks eating into the
 * bottles, whose darkest glass is close to the background.
 *
 * The sources arrive as "WhatsApp Image …(1)/(2).jpeg" with nothing to say which
 * is which; they are copied to pack-6/12/24 first so the mapping lives in the
 * filename rather than in someone's memory.
 */
console.log("\nPack shots (black keyed out):");
for (const count of [6, 12, 24]) {
  await cutout({
    src: s(`bottles/pack-${count}.jpeg`),
    out: `pack-${count}.png`,
    resizeWidth: 1000,
    tol: 30,
    feather: 60,
  });
}

/*
 * The single bottle, from the same studio session as the pack shots above and on
 * the same pure black, so it gets the same treatment and the same numbers.
 *
 * This replaces an earlier mockup render (`cafete-bottle-transparent.png`) that
 * was cropped tight enough to clip the cap and the base and was covered in
 * condensation. The owner asked for "die einzelne richtige" — the proper single
 * bottle — on 11 Sept, and it matches the pack shots, which the mockup did not.
 * The output filename is unchanged so every use of it picks this up.
 */
console.log("\nSingle bottle (black keyed out):");
await cutout({
  src: s("bottles/bottle-single.jpeg"),
  out: "bottle-transparent.png",
  resizeWidth: 1000,
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

// Founder portraits. Delivered as 2832x4240 TIFFs despite the .jpeg extension,
// which is why they need `sharp` rather than a plain copy. Cropped to 4:5 from
// the top so the head and torso survive and the legs are trimmed.
// Per Tobias: 009 is Kareem, 007 is Hannes.
console.log("\nFounder portraits:");
await photo({
  src: s("Kareem_F_009.jpeg", "Kareem_F_009 2.jpeg"),
  out: "founder-kareem.jpg",
  // Cropped in slightly so he fills the frame like Hannes does. Hannes' studio
  // source is already tight, so it cannot be widened to match — the give has to
  // come from Kareem's side, where there is plenty of canvas.
  region: { left: 0.061, top: 0.0995, width: 0.878, height: 0.733 },
  width: 1200,
  height: 1500,
  position: "top",
  quality: 84,
});
await photo({
  /*
   * Replaced 2026-08-24: the owner cut Hannes out of the river shot and placed
   * him on a grey wall matching Kareem's studio backdrop, with a cast shadow.
   *
   * Note the source filenames in the dossier are misleading — every river shot
   * of Hannes is named "Kareem_F_00x". This one was exported by hand.
   */
  // Replaced 2026-09-08: a proper landscape studio shot against concrete.
  // Because the source is landscape, the 4:5 portrait frame has to come out of
  // the middle — hence a narrow horizontal window at full height.
  src: s("Hannes Suit.jpg"),
  out: "founder-hannes.jpg",
  region: { left: 0.284, top: 0, width: 0.532, height: 1 },
  width: 1200,
  height: 1500,
  position: "top",
  quality: 88,
});

/*
 * Open Graph image, 1200x630 — what WhatsApp, LinkedIn and Facebook show when the
 * link is shared. There was none, so shared links rendered with no preview at all.
 *
 * Composed from the real assets rather than generated at runtime: the logo already
 * carries the exact #FF751F background, so on an orange canvas its tile vanishes
 * and the mark reads as if placed straight on. Legibility as a small thumbnail is
 * the only real design constraint, which is why it is the logo and slogan rather
 * than any of the moody photography.
 */
console.log("\nOpen Graph image:");
{
  const W = 1200;
  const H = 630;
  const canvas = sharp({
    create: { width: W, height: H, channels: 4, background: "#FF751F" },
  });

  const logo = await sharp(path.join(OUT_DIR, "logo-cafete.png"))
    .resize({ width: 520 })
    .toBuffer();
  const sloganImg = await sharp(path.join(OUT_DIR, "banner-slogan.png"))
    .resize({ width: 560 })
    .toBuffer();
  const bottleImg = await sharp(path.join(OUT_DIR, "bottle-transparent.png"))
    .resize({ height: 600 })
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const bottleMeta = await sharp(bottleImg).metadata();

  await canvas
    .composite([
      { input: bottleImg, left: W - bottleMeta.width - 60, top: H - bottleMeta.height },
      { input: logo, left: 70, top: Math.round(H / 2 - logoMeta.height / 2 - 40) },
      {
        input: sloganImg,
        left: 70,
        top: Math.round(H / 2 + logoMeta.height / 2 - 40 + 24),
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT_DIR, "og-image.jpg"));

  const meta = await sharp(path.join(OUT_DIR, "og-image.jpg")).metadata();
  console.log(`  og-image.jpg                       ${meta.width}x${meta.height}`);
}

if (skipped.length > 0) {
  console.log(
    `\n${skipped.length} source(s) not found, so those assets in public/ were left as they are:`,
  );
  for (const name of skipped) console.log(`  ${name}`);
  console.log(`Looked in:\n  ${[SOURCE_DIR, ...EXTRA_DIRS].join("\n  ")}`);
}

console.log("\nDone.");
