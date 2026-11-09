# Family Rosary website proposal

[Open the review website](https://emmanuelepau.github.io/family-rosary-proposal/)

Version 1.5.0, 9 November 2026. Six-page WordPress proposal using HCFM.org’s Whitney, Calluna and PlaylistScript typography, official Family Rosary marks, white reading surfaces, HCFM blue and selective yellow. This is the public design proposal; the ministry website is unchanged.

## This revision

- Watch & Listen now opens with a four-selection cinematic carousel, manual selectors, pause/resume and explicit Watch/Listen actions. Horizontal shelves use visible next-item peeks, scroll controls and quiet popularity numerals.
- The catalog contains 57 programs: 22 videos and 35 podcast episodes. All 46 prior IDs remain. Eleven FTP additions cover family testimony, prayer at home and Digital Age Family Safety. Two lead family interviews use actual footage frames. Publisher/series metadata stays attributed; unavailable production credits are not invented.
- Program details include synopsis, source information, series episodes, deliberately selected related programs and provider playback. Episode changes hand focus to the new heading; Back/Escape restore browsing context. Providers load only after an explicit action and unload on close.
- The four Rosary popularity counts are dated YouTube snapshots, checked 9 November 2026, not first-party audience figures or live personalized rankings. No invented ratings, matches, likes or viewer recommendations.
- Resource artwork is composed for its wide frames, with the complete Companion cover, Emmy’s selected Canva child photograph, and cross-only prayer artwork. Age groups open short usable activities and prayers on-site. Preteens and Teenagers are distinct options. The intention route is named separately from finding a prayer.
- The guide uses a lit, interactive Three.js Rosary with deterministic anatomy: 59 beads, 53 Hail Mary and six Our Father; opening cross → one → three → one → medal; five ten-bead groups separated by four Our Father beads. Accessible prayer controls remain equivalent to canvas interaction. This is a 3D model, not a claim of photographic or ecclesiastically certified artwork.
- Print a Guide opens a readable on-site page with prayer words and all four mystery sets, plus print styling. Original PDF destinations remain available where relevant; PDFs have not all been converted.

## Source and build

Repository: EmmanuelEpau/family-rosary-proposal. Base commit a47f7232fb683cd8baab90506d10c27e3e3c6d03. Native patterns, parts and assets live in wordpress/family-rosary; docs is their static review export. Development work is isolated in the dated task-folder clone.

Run npm ci, then npm run build. The build bundles the same-origin Rosary module and exports six review routes plus downloads/family-rosary-theme-1.5.0.zip. Historical packages remain. Edit content/media.json and the media generator together; run python3 scripts/build-cinema.py before building after media-template changes. Three.js and esbuild versions are pinned in package-lock.json. Bundled library notices are retained.

## Verification for 1.5.0

- Static build, JavaScript syntax and authored-source whitespace checks pass. Generated Three.js bundles retain upstream GLSL string whitespace and are excluded from that cosmetic check.
- scripts/check-rosary.mjs verifies total and prayer bead counts, opening strand order, all five decade mappings and four loop separators.
- Internal-browser checks cover all six routes at 320, 390, 768, 781, 1256, 1440 and 2560 pixels: 42 checks, no horizontal overflow, one H1 per route and no broken initial eager images.
- WordPress’s actual editor parser validates 595 blocks across 20 pattern/template/part documents with zero invalid blocks.
- Details, keyboard episode selection, curated related programs, Back/Escape focus restoration, search empty/reset, 35-podcast filtering, explicit provider mounting/unloading, age activities and prayer-step selection were exercised in the internal browser. Desktop/phone captures include the media page, details, home, resources, prayer reader and printable web guide.
- A fresh independent finish review returned ship after editorial relationships and in-dialog focus were corrected. Design documentation records the observed system.

The retained npm run check launches an external browser, so it was not run under Emmy’s internal-browser-only instruction. Its selectors/counts were updated and syntax checked; this is not a claim that its accessibility scans passed. Reduced-motion behavior was inspected in source, not emulated. Full provider viewing/listening, physical printing, field Core Web Vitals, complete editor save/reopen and production licensing are not certified.

## Search and release limits

SEARCH-DISCOVERY.md retains the Ahrefs-informed topic map, existing ranking paths and AEO/SEO requirements. The prayer guide owns the main how-to intent. Query-selected media details are not a substitute for final dedicated indexable watch pages/transcripts. The new print route needs a production canonical/indexing decision.

Only the GitHub review proposal is released. HubSpot, Canva and the live ministry site remain unchanged. Review pages retain noindex and the proposal notice. No traffic, ranking, AI-citation or engagement lift is guaranteed. Fonts use existing HCFM delivery and are not redistributed; marks, photography and media retain their owners’ rights.
