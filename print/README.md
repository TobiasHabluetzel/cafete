# Print files

QR codes for the flyers and the stickers. Nothing in this folder is served by the
website — it exists to be handed to a printer or dropped into Canva.

Regenerate with `npm run qr` (see `scripts/generate-qr.mjs`).

## Which file

| File | Use it for |
| --- | --- |
| `cafete-qr.svg` | **The default.** Brand colours (charcoal on cream), vector, scales to any size. |
| `cafete-qr-logo.png` | Flyers and anywhere the code is 30 mm or bigger — the brand code with the logo in the middle. |
| `cafete-qr-black.svg` | Pure black on white. Use it on coloured stock, for one-colour printing, or if a printer reports a problem with the others. |
| `cafete-qr-black.png` | Same, for tools that will not take an SVG. |

## Rules for placing them

- **Do not crop the whitespace.** The border around the code is part of it: four
  modules of quiet zone are the spec minimum, and a code without it fails on
  older scanners. The files already contain exactly that and no more.
- **Do not recolour and do not invert.** Dark code on a light background. A light
  code on dark stops a lot of phone cameras, and the brand orange is not dark
  enough to be read as a module.
- **Do not place it on a photo or a gradient.** The background inside the file has
  to stay the background.
- **Print at 21 mm square or larger.** At that size it reads from roughly 20 cm
  away — arm's length. Rule of thumb: scanning distance is about ten times the
  width of the code, so a code on a poster wants to be much bigger.
- **Use `cafete-qr-logo.png` only at 30 mm or above.** The logo covers about 5 %
  of the code, which the error correction absorbs easily, but at sticker size the
  modules around it get too small to survive a scuff as well.

All four files encode **https://www.drink-cafete.ch/qr**, which sends the scan to
the landing page in the phone's own language (German or English).

**Scan the actual proof before the run goes ahead**, on both an iPhone and an
Android phone, and from about a metre away. Fifteen seconds of checking against a
pallet of unscannable stickers.
