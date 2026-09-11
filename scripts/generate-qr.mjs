/**
 * Generate the print-ready QR codes for the flyers and stickers.
 *
 *   node scripts/generate-qr.mjs [url]
 *
 * Everything lands in `print/`, which exists for the printer and for Canva —
 * none of it is served by the site.
 *
 * Two decisions worth knowing about before you change anything here:
 *
 * - **Error correction level H** (30 % recoverable), not the usual M. A sticker
 *   gets rained on, scuffed and stuck over a seam, and a flyer gets folded. H
 *   also buys the headroom that makes the logo overlay safe.
 * - **Four modules of quiet zone**, the spec minimum. Designers routinely crop it
 *   off, and a code with no quiet zone fails on older scanners. If you place
 *   these files yourself, keep the whitespace that is already in them.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";

const OUT_DIR = path.join(import.meta.dirname, "..", "print");
const LOGO = path.join(import.meta.dirname, "..", "public", "logo-cafete.png");

/**
 * The short path handled in `src/proxy.ts`, which then redirects to the landing
 * page in the scanner's own language.
 *
 * The `www` host is deliberate and verified against production (11 Sept 2026):
 * the apex 301s to `www`, and the site canonicalises to `www`. A redirect hop
 * inside a QR scan is a visible stall on a phone with one bar of signal.
 *
 * Hardcoded rather than read from `NEXT_PUBLIC_SITE_URL`, which is `localhost`
 * often enough that a print run pointing at a dev machine is a real risk. Pass a
 * URL as the first argument to override it.
 */
const DEFAULT_URL = "https://www.drink-cafete.ch/qr";

/** Brand palette, matching the tokens in `src/app/globals.css`. */
const CHARCOAL = "#14100eff";
const CREAM = "#f7eeddff";
const BLACK = "#000000ff";
const WHITE = "#ffffffff";

const PNG_SIZE = 2048;

const BASE = { errorCorrectionLevel: "H", margin: 4 };

/**
 * How wide the logo plate is, as a fraction of the whole image.
 *
 * The logo is close to square, so 0.24 of the width covers under 5 % of the
 * area — well inside what level H can reconstruct, and, because the quiet zone
 * pushes the code inward, nowhere near the three finder squares in the corners.
 * Those are the one part no error correction can replace.
 */
const PLATE_FRACTION = 0.24;

/** The physical size the SVGs declare. Vector, so scale it freely from here. */
const PRINT_MM = 30;

async function svg(file, dark, light, url) {
  const markup = await QRCode.toString(url, {
    ...BASE,
    type: "svg",
    color: { dark, light },
  });

  // The library emits a viewBox and nothing else. Illustrator and most
  // print workflows want a real size, and left to guess they pick 41×41 px —
  // a QR code the size of a full stop.
  await writeFile(
    path.join(OUT_DIR, file),
    markup.replace("<svg ", `<svg width="${PRINT_MM}mm" height="${PRINT_MM}mm" `),
    "utf8",
  );
  return file;
}

async function png(file, dark, light, url) {
  const buffer = await QRCode.toBuffer(url, {
    ...BASE,
    type: "png",
    width: PNG_SIZE,
    color: { dark, light },
  });
  await writeFile(path.join(OUT_DIR, file), buffer);
  return file;
}

/**
 * The brand code with the logo dropped into the middle.
 *
 * Built outward from the logo with `extend` rather than by containing it inside a
 * square: the logo is 570×451, and letterboxing it into a square both wasted
 * covered area and — with sharp's opaque-black default fill — put two black bars
 * across the code.
 *
 * Two rings around it, both load-bearing:
 *   - a black border, which is the same outline the mark carries everywhere else
 *     on the site, and which stops the logo's orange bleeding into the modules;
 *   - a cream gap outside that, so the black border never touches a dark module
 *     and start-and-stop the scanner's pattern hunt.
 */
async function pngWithLogo(file, url) {
  const code = await QRCode.toBuffer(url, {
    ...BASE,
    type: "png",
    width: PNG_SIZE,
    color: { dark: CHARCOAL, light: CREAM },
  });

  const { width: logoWidth, height: logoHeight } = await sharp(LOGO).metadata();

  const plateWidth = Math.round(PNG_SIZE * PLATE_FRACTION);
  const gap = Math.round(plateWidth * 0.05);
  const border = Math.round(plateWidth * 0.035);
  const inner = plateWidth - 2 * (gap + border);

  const logo = await sharp(LOGO)
    .resize(inner, Math.round((inner * logoHeight) / logoWidth))
    .toBuffer();

  // Two pipelines, not two chained `extend` calls: sharp keeps one set of extend
  // options, so a second call replaces the first rather than adding a ring —
  // which silently dropped the black border and left the logo bleeding into the
  // cream.
  const framed = await sharp(logo)
    .extend({ top: border, bottom: border, left: border, right: border, background: BLACK })
    .png()
    .toBuffer();

  const plate = await sharp(framed)
    .extend({ top: gap, bottom: gap, left: gap, right: gap, background: CREAM })
    .png()
    .toBuffer();

  const { width: plateW, height: plateH } = await sharp(plate).metadata();

  await sharp(code)
    .composite([
      {
        input: plate,
        top: Math.round((PNG_SIZE - plateH) / 2),
        left: Math.round((PNG_SIZE - plateW) / 2),
      },
    ])
    .png()
    .toFile(path.join(OUT_DIR, file));

  // The safety-relevant number: level H recovers about 30 % of the code.
  return { file, covered: (plateW * plateH) / (PNG_SIZE * PNG_SIZE) };
}

async function main() {
  const url = process.argv[2] ?? DEFAULT_URL;

  // Throws on anything a scanner could not encode, before we write four files.
  const created = QRCode.create(url, BASE);
  const modules = created.modules.size;

  await mkdir(OUT_DIR, { recursive: true });

  const written = [
    await svg("cafete-qr.svg", CHARCOAL, CREAM, url),
    await svg("cafete-qr-black.svg", BLACK, WHITE, url),
    await png("cafete-qr-black.png", BLACK, WHITE, url),
  ];
  const logo = await pngWithLogo("cafete-qr-logo.png", url);

  // Below roughly 0.5 mm per module, phone cameras start to struggle; 10× the
  // code's width is the usual rule of thumb for scanning distance.
  const minMm = Math.ceil(modules * 0.5) + 4;

  console.log(`\nEncoded: ${url}`);
  console.log(`Version ${created.version}, ${modules}×${modules} modules, level H`);
  console.log(`Print at ${minMm} mm square or larger; readable from ~${minMm}0 mm away.`);
  console.log(`Logo covers ${(logo.covered * 100).toFixed(1)} % of the code (level H recovers ~30 %).`);
  console.log(`\nWritten to print/:`);
  for (const file of [...written, logo.file]) console.log(`  ${file}`);
  console.log(
    "\nScan every file on a real phone before it goes to the printer — " +
      "especially cafete-qr-logo.png.\n",
  );
}

await main();
