# Brand assets

These are the designer's real files, processed by
[`scripts/process-assets.mjs`](../scripts/process-assets.mjs). **Don't hand-edit
them** — drop updated sources into the folder and re-run:

```bash
node scripts/process-assets.mjs "/Users/tobiashablutzel/Desktop/Cafeete"
```

| Output | Source | Treatment |
| --- | --- | --- |
| `logo-cafete.svg` | Traced from `Cafété Logo satt.png` | Vector master in the exact brand colours, **orange background kept** |
| `logo-cafete.png` | `logo-cafete.svg` | Rendered at 1710 px; what the site serves, because the SVG is far heavier |
| `cafete-clip-poster.jpg` | `cafete-clip.mp4` at 14 s | Video still, enlarged 2×, q82 |
| `banner-slogan.png` | `Slogan Orange Schwarz optimiert mit Lineal.png` | Orange keyed out → black ink on transparent |
| `coffee-cherry-illustration.png` | `Kaffeekirsche.png` | Orange keyed out via border flood fill |
| `coffee-cherry-photo.jpg` | `Kaffeekirsche für Post.png` | Resized, mozjpeg q84 |
| `founder-kareem.jpg` | `Kareem_F_009.jpeg` | 4:5 top crop, mozjpeg q84 |

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

The source is named `Kareem_F_009`. Two quirks worth knowing:

- It is a **TIFF with a `.jpeg` extension** (2832×4240, ~36 MB), which is
  why it needs `sharp` rather than a plain copy — and why some tools refuse to
  open it.
- It arrived in `~/Downloads` rather than the asset folder, so the script falls
  back to searching there. It also accepts the `Kareem_F_009 2.jpeg` duplicate
  name. Moving it into the asset folder alongside the others is tidier.

## Still missing from the designer

- **The designer's vector logo.** `logo-cafete.svg` is a trace of the 570×451 PNG:
  faithful, but the finest hatching on the bean is simplified. Replace it if the
  original `Cafete.eps` turns up.

## Fruit in the scroll story (`fruit/`)

Drawn for CAFÉTÉ as SVG and rendered to WebP: coffee cherries, cranberries and coffee leaves. No third-party images. Sources and the render script are in `design/fruit/`; run `node design/fruit/render-fruit.mjs` after changing a drawing.
