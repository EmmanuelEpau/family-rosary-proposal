---
name: Family Rosary
description: HCFM family prayer and image-led media discovery
colors:
  blue: "#0047bb"
  gold: "#ffb500"
  paper: "#ffffff"
  ink: "#000000"
  muted: "#454545"
  line: "#dedede"
  cinema-night: "#001c49"
typography:
  display:
    fontFamily: "Calluna, Georgia, serif"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-.02em"
  headline:
    fontFamily: 'Whitney, "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(36px,4vw,58px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-.035em"
  body:
    fontFamily: 'Whitney, "Helvetica Neue", Arial, sans-serif'
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.55
  reading:
    fontFamily: "Calluna, Georgia, serif"
    fontSize: "26px"
    lineHeight: 1.55
  accent:
    fontFamily: "PlaylistScript, Calluna, Georgia, serif"
    fontWeight: 700
    letterSpacing: "0"
rounded:
  button: "8px"
  cinema-control: "7px"
  media-art: "9px"
  panel: "12px"
  prayer-stage: "16px"
spacing:
  gutter: "clamp(24px,5vw,80px)"
  section: "clamp(60px,7.2vw,104px)"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  cinema-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.cinema-control}"
    padding: "14px 23px"
  cinema-primary-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.blue}"
  media-art:
    backgroundColor: "{colors.cinema-night}"
    rounded: "{rounded.media-art}"
  detail-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
---

# Design System: Family Rosary

## Overview

**Creative North Star: "Family Rosary within HCFM.org"**

White browsing and reading surfaces, HCFM blue and yellow, and the incumbent Whitney/Calluna/PlaylistScript pairing hold the identity together. Photography invites a family into a story; readable prayer and editorial content give them somewhere useful to stay. Cinematic treatment is concentrated in media artwork, featured stories and player moments.

This records the implemented proposal, not a new identity. Source authority is `wordpress/family-rosary/assets/site.css` (including its later overrides), `wordpress/family-rosary/theme.json`, and the corresponding exported `docs/assets/site.css`. Product commitments are in `PRODUCT.md`; the approved surface direction is `../research/streaming-v2/DIRECTION.md`. No measured engagement outcome or exact palette-area ratio is asserted.

**Key Characteristics:**
- White reading surfaces with blue structure and yellow action accents.
- Editorial serif headlines and prayer reading beside clear sans-serif navigation.
- Image-led shelves, context-preserving details, and accessible on-site prayer.

## Colors

### Primary

**HCFM Blue** (`colors.blue`) supplies primary actions, prayer sections, links and the family hero. **Cinematic Night** (`colors.cinema-night`) supplies artwork bases and photographic fades in the media view; it is a contextual surface, not a replacement brand.

### Secondary

**HCFM Yellow Gold** (`colors.gold`) marks the media play action, short script accents and selected prayer beads. The rosary's metallic material is a separate physical rendering color, not a flat UI gold token.

### Neutral

**White reading surface**, **Black ink**, **Muted text**, and **Divider** use the corresponding frontmatter tokens. The footer and existing home media band retain black surfaces; do not infer a site-wide black background from those exceptions. Pale blue and warm activity states are local component treatments documented below.

**The Reading Surface Rule.** Preserve light browse/detail/reading surfaces while using cinematic fades where artwork needs them.

Evidence: stylesheet root properties (line 9), HCFM system overrides (line 31), cinema section, prayer/activity sections; theme palette under `settings.color.palette`. The theme retains historical `parchment` as a slug for white.

## Typography

Whitney is the interface and section-heading family. Calluna carries editorial hero/story headlines, leads and prayer reading. PlaylistScript is a short accent, not paragraph text. Font-face declarations load HCFM-hosted WOFF2 files with local fallbacks and `font-display:swap` (stylesheet lines 1–8).

The frontmatter records representative roles, not a universal modular scale. Body reduces to (18px) on mobile. Editorial hero/story headings use the display family; media feature headings deliberately use Whitney, with desktop (clamp(42px,4vw,60px)), mobile (40px), and narrow-phone (36px). Media card titles use Whitney (19px/1.25). Prayer words use Calluna (26px/1.55), reducing to (24px); the printable guide has its own point-based print scale. Paragraphs default to a maximum (70ch), with narrower local measures.

**The Type Role Rule.** Keep the editorial, interface and short script roles distinct; a media title does not establish the font for all editorial headlines.

Evidence: stylesheet base rules, HCFM typography override, “Match HCFM's editorial hero” block, cinema rules and final desktop correction.

## Layout

The shared wrap is a centered fluid width minus twice the gutter, capped at (1280px). The stylesheet later gives the home cinematic copy a (1320px) cap: this is a component exception. WordPress declares reading content (760px) and wide content (1280px). Sections use the frontmatter fluid spacing; local shelf and prayer padding is intentionally denser.

The main phone breakpoint is (780px): shared gutters become (24px), navigation folds, grids stack, and media artwork becomes a separate image above reading copy. At (420px), shared gutters become (20px). Additional component adjustments occur at (1050px), (1100px), (900px), (360px) and wide-screen breakpoints; these are not one interchangeable global scale.

Media shelves scroll horizontally with visible next-item context. Desktop cards use wide (16:9) artwork. The phone detail dialog fills the viewport; desktop is capped at (1060px) with viewport margins. Resource covers are composed for a (1.6) aspect ratio and container-relative title sizing; do not stretch a portrait cover into the entire wide frame.

Evidence: `.fr-wrap`, `.fr-section`, theme layout settings, cinema responsive rules, final resource-cover overrides.

## Elevation & Depth

Depth combines tonal surfaces, photographic gradients and restrained interactive lift. A hovered/focused media card moves upward (4px) and gains a soft shadow; the detail dialog uses a substantial ambient shadow and a dimmed, blurred backdrop. Prayer beads use small material shadows and selected-state lift. These are component-specific treatments, not a global shadow scale.

- Media hover: `0 10px 20px rgba(0,28,73,.16)`.
- Detail dialog: `0 24px 90px rgba(0,0,0,.35)`.
- Activity container: `0 3px 15px rgba(0,71,187,.06)`.

Media easing is `cubic-bezier(.16,1,.3,1)`; card lift takes (.3s), image zoom (.5s), and dialog arrival (.28s). Global reduced-motion rules suppress transitions and animations. Never require motion to understand state.

Evidence: `.cinema-card-link`, `.cinema-dialog`, `.fr-age-options`, reduced-motion media queries.

## Shapes

The system uses modest rounded rectangles rather than one universal radius. Standard buttons, media controls, artwork, light panels and prayer stages use the named frontmatter radii. The prayer reader uses panel rounding; circular accessible bead controls are (44px) minimum, while beginning/end controls are capsules. Phone details become square-cornered/full-screen. Wide resource covers use panel rounding. Thin dividers structure reading and episode rows.

Evidence: standard button override, `.cinema-card-art`, `.cinema-dialog`, `.fr-sacred-rosary`, `.fr-decade-beads`, `.fr-resource-cover`.

## Components

### Buttons and navigation

Standard blue actions use white text and (52px) minimum height; hover becomes black. The media play action is yellow/black, (50px) minimum, with a white/blue hover. Home hero and prayer controls have their own contextual overrides. Base focus is a blue (3px) outline offset (5px); media links/buttons use yellow (3px) offset (4px). Header navigation uses Whitney; media subnavigation becomes a horizontal scrolling row on phones.

### Fields and prayer jump controls

Media search is white with a cool outlined border, (7px) corners, leading icon space and (52px) minimum height. Resource filters and prayer selects retain native controls and their own padding/borders. Sticky prayer jump links are pale blue with blue text, (7px) corners and (48px) minimum height; hover reverses to blue/white. These links are navigation, not generic filter chips.

### Media cards and details

Wide photographic art sits above captions on white. Hover reveals the open affordance, subtly lifts the art and zooms the image. Ranked Rosaries place muted large numerals near the artwork; ranking is not a popularity claim. Detail art is distinct from shelf and feature art, followed by a light body, episode/about/related tabs and explicit playback. Native dialog behavior and focus recovery are implemented in `assets/cinema.js`; never treat a static preview snippet as the full interaction implementation.

### Prayer, activities and resource covers

The deterministic 59-bead rosary (`src/rosary-layout.mjs`, `src/rosary-scene.js`) uses blue physical beads, metallic gold Our Father beads, chain, medal and cross, environment lighting and soft shadows. This is a rendered model, not a claim of photographic realism. Its decorative canvas is paired with native prayer controls and fallback imagery; selected beads gain yellow emphasis. Do not replace equivalent accessible controls with canvas-only interaction.

Age activities use native details/summary, white cards and a warm open state (`#fff8df`), with Calluna prayer text. Wide resources combine separately positioned cover/art imagery with a reserved title region. Final container-relative title sizes take precedence over earlier viewport sizing. The printable prayer guide uses a separate letter-page print layout.

Evidence: prayer/activity and resource blocks at stylesheet end, `assets/prayer-experience.js`, rosary source modules, native patterns.

## Do's and Don'ts

### Do:
- **Do** keep Whitney, Calluna and PlaylistScript in their evidenced roles.
- **Do** preserve light reading surfaces and blue/yellow brand continuity.
- **Do** compose separate wide shelf, feature and detail artwork for legible crops.
- **Do** retain visible focus, native controls, reduced motion and usable phone layouts.

### Don't:
- **Don't** make cinematic dark media surfaces the background for every screen.
- **Don't** turn local component radii, shadows or font exceptions into universal tokens.
- **Don't** describe generated artwork or the 3D rosary as sourced photography.
- **Don't** infer popularity, live status or measured engagement from visual prominence.
