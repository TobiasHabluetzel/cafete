# Brand assets

These are the designer's real files, processed by
[`scripts/process-assets.mjs`](../scripts/process-assets.mjs). **Don't hand-edit
them** — drop updated sources into the folder and re-run:

```bash
node scripts/process-assets.mjs "/Users/tobiashablutzel/Desktop/Cafeete"
```

| Output | Source | Treatment |
| --- | --- | --- |
| `logo-cafete.png` | `Cafété Logo satt.png` | Re-encoded, **orange background kept** |
| `banner-slogan.png` | `Slogan Orange Schwarz optimiert mit Lineal.png` | Orange keyed out → black ink on transparent |
| `coffee-cherry-illustration.png` | `Kaffeekirsche.png` | Orange keyed out via border flood fill |
| `coffee-cherry-photo.jpg` | `Kaffeekirsche für Post.png` | Resized, mozjpeg q84 |
| `bottle-photo.jpg` | `Cafété Mockup.png` | Resized, mozjpeg q86 |
| `founder-kareem.jpg` | `Kareem_F_009.jpeg` | 4:5 top crop, mozjpeg q84 |
| `founder-hannes.jpg` | `Kareem_F_007.jpeg` | Pre-cropped to match Kareem's scale, then 4:5, q84 |

## Why the logo keeps its orange background

The orange is **structural**, not backdrop: it forms the ring between the red
circle and the red flames, and it is one continuous region with the outer
background. Any fill that removes the outer orange also removes that ring and
leaves a hole through the artwork. So the logo is used as a **sticker** — an
orange tile with a black keyline — which is faithful to the artwork and gives us
the graffiti-flyer motif used throughout the site.

Consequence: **the logo always sits on its own orange tile**, never directly on
a section background.

## Why the slogan banner is keyed differently

It is pure black lettering on pure orange, so instead of a flood fill we project
each pixel onto the black→orange axis and use its position as alpha. That
reconstructs the anti-aliased edges exactly — a flood fill left a visible orange
fringe once the 12500px-wide source was downscaled.

Consequence: the slogan is **black ink on transparent**, so it needs a light or
orange surface behind it. It is invisible on charcoal. Both the hero banner and
the marquee put it on an orange band.

## Founder photos

Both are named `Kareem_F_*` regardless of subject: **009 is Kareem, 007 is
Hannes** (confirmed by Tobias). Two quirks worth knowing:

- They are **TIFFs with a `.jpeg` extension** (2832×4240, ~36 MB each), which is
  why they need `sharp` rather than a plain copy — and why some tools refuse to
  open them.
- They arrived in `~/Downloads` rather than the asset folder, so the script falls
  back to searching there. It also accepts the `Kareem_F_009 2.jpeg` duplicate
  name. Moving them into the asset folder alongside the others is tidier.

Hannes was photographed further from the camera, so his source is pre-cropped
(`region` in the script) to roughly match Kareem's scale before the shared 4:5
crop. Adjust those fractions if the framing should change.

## Still missing from the designer

- **A vector logo.** The source is only 570×451, so the header and hero render it
  below 2× on retina. An SVG or a ≥1500px PNG export would sharpen it.
