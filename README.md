# Enerpy Ambiental — landing page

**Live demo:** https://giro54bo.github.io/enerpy-ambiental-landing/

Static demo landing built from `Context/Web Express - Brief para diseño.pdf` (brief 07,
17 Aug 2026, Valeria Pardo), structured after the Upmind reference and styled after Wise.

## Run it

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`. No build step, no dependencies — deploy by uploading
`index.html`, `styles.css`, `main.js` and `img/` to any static host.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole page: 12 sections + nav + footer, plus meta and JSON-LD |
| `styles.css` | Design tokens and all styling. No framework |
| `main.js` | Nav drawer, process stepper, scroll reveal. ~130 lines, no dependencies |
| `img/` | Web-ready images, renamed and re-encoded from `Assets/Img/` |
| `Assets/`, `Context/` | Local source material — excluded from this repo, see below |

## Typography

Driven entirely by CSS custom properties in `:root` — a `--fs-*` scale plus composite
`--type-*` tokens using the `font` shorthand. Because `letter-spacing` is not part of that
shorthand, each token carries a paired `--type-*-ls` applied in a second declaration:

```css
.h2{ font:var(--type-h2); letter-spacing:var(--type-h2-ls); }
```

One family throughout: **Archivo** (`--font-sans`), loaded at 300/400/500/700 plus 400
italic. Root size is `--fs-root:16px`. Nothing outside `:root` sets a literal font size
except the footer wordmark, which is a decorative watermark rather than text.

### The scale

Five text steps with committed ratios, plus fluid display sizes:

| Token | Size | Role | Ratio to next |
|---|---|---|---|
| `--fs-lg` | 20px | subheads, card titles | 1.25 |
| `--fs-body` | 16px | body copy, quotes, nav, links | 1.23 |
| `--fs-sm` | 13px | short descriptions, fine print | 1.18 |
| `--fs-caps` | 11px | uppercase micro-labels | — |

This replaced a nine-step ramp (1.05 → 0.61rem) whose ratios ran as flat as 1.03: at
15.2 / 14.7 / 13.8px, three different roles were rendering at what read as one size set
slightly wrong. Body copy was also below the 16px legibility floor.

### Display leading

Archivo Light measures **0.723em** from the baseline to the accent of an accented
lowercase (í ó ú á) and **0.182em** to the tail of a *g* — 0.905em of real ink. Any
line-height below that makes stacked lines touch, and Spanish accents far more often than
English. The previous `0.77` left 0.125em of overlap, clearly visible on *"Una tecnología
única en Paraguay que transforma residuos en materia prima."* at five lines.

- `--lh-hero: .95` — 0.045em of clearance
- `--lh-h2: 1` — 0.095em; section headings reach five lines

Measured across the nine headings that currently wrap, the worst clearance is +4.9px.

### Fallback metrics

`@font-face` registers a metric-matched **"Archivo Fallback"** over `local("Arial")` in
four weight-scoped faces, because Archivo's width mismatch against Arial is not constant:
setting the same string at 100px, Archivo measures 2552.7px at weight 300 against Arial's
2640.5 (Arial has no 300 and substitutes 400), 2598.2 vs 2640.5 at 400, 2643.7 vs 2640.5
at 500, and 2787.5 vs 2828.5 at 700.

A single `size-adjust` tuned for body weight is not enough — it left the 300-weight RMO
heading wrapping to six lines in the fallback and five in Archivo, a 67px jump during the
swap. With the four faces, reflow across all 53 text blocks measures **0px**, against 67px
with plain Arial.

## Palette

The palette image you supplied, as tokens in `styles.css`:

| Token | Hex | Role |
|---|---|---|
| `--softwood` | `#013540` | Primary dark ground |
| `--stormcloud` | `#416870` | Secondary text on light |
| `--seastone` | `#809AA0` | Palette reference |
| `--muted` | `#93ADB3` | Seastone lightened — body text on dark |
| `--iron` | `#BFCCCF` | Light neutral, borders |
| `--lime` | `#B1F727` | CTAs, accents, the benefits band |
| `--ink` / `--paper` | `#011F26` / `#F4F7F7` | Derived deep dark / off-white |

**Note:** Seastone at `#809AA0` measures 4.45:1 on Softwood — just under the 4.5:1 WCAG AA
threshold for body text. `--muted` (`#93ADB3`) is used for actual text instead. All 33
text/background pairs on the page now pass AA.

## Deviations from the brief — please review

1. **Palette.** The brief specifies Enerpy's own colors (`#1C6434` green, `#F9C102`
   yellow, sage `#B6C3AA`) and says *"verde y blanco como base visual, reservando el
   amarillo para CTAs."* You directed the Softwood/Electric-Lime palette instead, so the
   brief's palette is not used anywhere on the page.

2. **Logo — one deliberate tonal adjustment.** In the supplied white asset the wordmark
   is `#FFFFFF` and the circle behind "Py" is `#E8E8E8` — only **1.23:1** apart, so those
   two glyphs visually disappear into their own circle on a dark ground.

   `img/enerpy-white-adjusted.svg` darkens **only** that circle to `#93ADB3`, the same
   value as the `--muted` token in `styles.css`, so the mark reads as part of the site's
   palette rather than a neutral grey. Diffed against the source it is a single changed
   hex value — wordmark, leaf, gradient and all geometry are untouched.

   | | contrast |
   |---|---|
   | White "Py" against the circle | 1.23:1 → **2.37:1** |
   | Circle against the nav (`#011F26`) | 7.24:1 |
   | Circle against the footer (`#013540`) | 5.60:1 |

   Note that WCAG 1.4.11 explicitly exempts logotypes from contrast requirements, so this
   is an aesthetic judgement, not a compliance one. A neutral `#8A8A8A` would push the
   "Py" to 3.45:1 and `#809AA0` (Seastone) to 2.98:1 if more separation is ever wanted —
   both are a one-value edit in that file.

   The pristine files ship alongside and nothing overwrites them:
   - `img/enerpy-white.svg` — byte-for-byte copy of `logoAmbiental-white.svg`
   - `img/enerpy-color.svg` — byte-for-byte copy of `logoAmbiental.svg`

   Nav and footer use the adjusted file. The favicon and the `Organization.logo` in the
   structured data use the full-colour original, since a white mark would be invisible on
   a light browser tab. **To revert:** point the two `<img>` tags in `index.html` back at
   `img/enerpy-white.svg`.

   Since the client asked that their mark not be modified, this adjustment is worth
   clearing with them — or asking them for a white export with more tonal separation,
   which would remove the need for it entirely.

3. **Two claims are hedged.** The brief's own notes require validation before publishing
   these, so they are softened on the page rather than stated outright:
   - *"tecnología patentada"* (brief §5) → rendered as **"Tecnología propia registrada"**
   - *"créditos de carbono"* (brief §7) → rendered as **"Potencial de valorización del
     residuo"**, with no carbon-credit claim

   Confirm both with the client before going live, then adjust §6 (Tecnología RMO) and
   §8 (Beneficios) in `index.html` if they're cleared.

4. **Client logos.** All 14 marks from `Assets/Img/Logos/Clientes` are in the trust
   marquee, per your instruction. The brief lists the authorized list as still pending
   (*"Mostrar únicamente logos previamente validados y autorizados"*) — worth confirming
   before this goes public.

## Pending content — nothing here is invented

Two placeholder systems, both deliberately impossible to mistake for real content:

| What | Where | How it renders |
|---|---|---|
| 6 case figures | `#casos` | Reference numbers under `.is-pending` (dashed underline) + a visible disclaimer in the section |
| 7 category visuals | `#residuos` | Now real photographs — see *Image sources* below |

```bash
grep -c "is-pending" index.html   # 6 — figures still awaiting real data
ls img/residuos/                  # 7 — category photos still placeholder
```

**The case figures on the page are NOT real.** Arcor 1.200 t / 8 años, BASF 850 t / 5 años,
Copetrol 640 t / 6 años are reference values added at the user's request so the layout can be
reviewed with numbers in it. They are marked three ways: the `.is-pending` dashed underline,
an HTML comment on each `<dd>`, and a visible note in the section itself. **Before publishing
as final:** replace with confirmed values, then remove `.is-pending` from those elements and
delete the disclaimer paragraph.

- **Arcor figures** (`X toneladas`, `X años`) arrived as literal placeholders in the client's
  brief for this section. The brief forbids inventing figures — *"No inventar información,
  cifras, años de experiencia…"* — so the numbers now shown are explicitly labelled reference
  values, not data, pending the real figures.
- **BASF and Copetrol** are illustrative scaffolding chosen from the existing client logos —
  they need confirming, and carry the same pending-authorization caveat as the marquee.
- **Category photos**: brief note #3 asks for real plant/waste photography rather than stock,
  so these placeholders want real photos, not stock replacements.
- **Testimonials** render with *cargo* + *industria* exactly as supplied. Name and empresa are
  still missing — the client raised this herself. Deliberately **no `Review` structured data**
  until then: Google requires a named reviewer, and marking up unattributed quotes as reviews
  risks a fabricated-social-proof penalty.

### Case figures (all six)

Every `.case__n` still carries `.is-pending`. The six tonnage figures — Arcor +200,
Kingspan +130, Unilever +80, BASF Paraguaya +80, Bebidas del Paraguay +20, Yguazú
Cementos +18 — are placeholders for layout and are **not confirmed data**. Replace them
with the client's real numbers and strip `.is-pending` before publishing.

Logo and photograph authorization is outstanding for all six companies, as it is for the
marquee. The three plant photographs added for BASF, Bebidas del Paraguay and Yguazú
Cementos were supplied by the client; confirm the usage rights carry to this page.

The Yguazú Cementos logo was supplied at 154×42px, which is exactly its rendered size, so
it resolves at 1× and looks soft on high-density screens. A source at 2× (≈308×84) or an
SVG would fix it.

## Content rules honored

Everything on the page comes from the brief; nothing was invented. No prices, no
certifications or regulatory seals, no absolute claims. Every mention of RMO® results
carries the qualifier that outcomes depend on the waste and require prior technical
evaluation.

**CTA:** every call to action reads **"Hablar con un experto"** with a WhatsApp icon and
links to `wa.me/595985121470`. Note this follows the brief's *"Texto de CTA principal:
Hablar con un especialista / Hablar con un asesor"* (p.7) but departs from its later
note #7, which asks that *"Solicitar evaluación técnica"* stay the primary CTA so
conversion points at an evaluation rather than a direct contact. Flagged for the client.

## SEO / GEO

- `lang="es-PY"`, title and description built on *"gestión de residuos industriales en Paraguay"*
- Open Graph + Twitter Card tags
- JSON-LD: `Organization`, `WebSite`, `Service`, and `FAQPage` mirroring all 5 rendered Q&As
- FAQ answers written as declarative single sentences so AI assistants can extract them

Absolute URLs currently point at the GitHub Pages demo, and the page carries
`<meta name="robots" content="noindex, nofollow">` so this preview cannot compete with
the client's live domain in search results.

**Before production:** remove the robots tag and swap `canonical`, `og:url`, `og:image`,
`twitter:image`, the `WebSite` node's `url`, and the `Organization` `logo` back to
`https://enerpyambiental.com.py/`. The `mailto:` links, the `Organization` `url`, and the
`#org` identifiers already point at the real domain and should be left alone.

## What is not in this repository

`Context/` (the agency brief, client brochures, the RMO technical sheet, an audio
recording) and `Assets/` (original source images) are excluded via `.gitignore` — this is
a public repository and that material is internal. The web-ready images live in `img/`.

## Accessibility

- Skip link is first in tab order and becomes visible on focus
- Lime 3px `:focus-visible` ring on every interactive element
- FAQ uses native `<details>/<summary>`; stepper exposes `aria-current`
- All motion — marquee, reveals, chips, stepper auto-advance — stops under
  `prefers-reduced-motion: reduce`
- Content is never permanently hidden if JS fails: reveal animations are gated on a `js` class

## Verified

Checked at 375 / 768 / 1280 px: no horizontal overflow at any width, no console errors,
all 49 images load, JSON-LD parses, and **190/190 visible text elements pass WCAG AA**.

The contrast check composites `rgba` layers properly — both foreground alpha and every
translucent ancestor background. An earlier naive version ignored alpha and produced both
false positives (white-on-softwood quotes reported as 1.00:1) and false negatives; two real
misses only surfaced once compositing was correct: `.ben__n` at 3.14:1 and `.is-pending` at
2.98:1, both now on `--stormcloud`.

## Image sources

The `#residuos` category photographs come from **Pexels**, whose licence permits
commercial use with no attribution required. Photo IDs are recorded so each can be
traced back or re-downloaded at higher resolution:

| Category | Pexels ID |
|---|---|
| RAEE | 38411741 |
| NFU | 38448743 |
| Aceites usados | 13065697 |
| Tintas y pinturas | 30548776 |
| Envases contaminados | 209230 |
| Agroindustriales | 36063252 |
| Otros residuos especiales | 6537735 |

Each is centre-cropped to 4:3 and encoded to webp at q74 (25–73KB).

Two choices worth knowing: **soy** was picked for the agro category because it is
Paraguay's dominant agro-industry, and **an industrial treatment plant** rather than a
landfill for "otros residuos especiales" — a pollution image argues against a company
whose service is preventing it.

Brief note #3 still asks for real Enerpy plant photography over stock. These are stock
and should be replaced when the client supplies their own.
