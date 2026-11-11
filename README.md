## Static review of 1.9.6-draft.11, 11 November 2026

`docs/` now holds the static design-review export of Family Rosary 1.9.6-draft.11, built from source commit `07e7f2c` in a private working copy. The source folders in this repository (`wordpress/`, `scripts/`, `src/`, `content/`) remain at 1.8.0 and do not rebuild this export.

The public review is static HTML, CSS, JavaScript, images and the PDFs its pages link to. Every page keeps the review label and noindex. Theme download archives are no longer served from `docs/downloads/`; earlier packages remain in this repository's history. GitHub Pages cannot run the WordPress live services, so the review shows the design and recorded playback.

The nine main pages are available in English, Spanish, French, Bangla, Portuguese, Swahili and Italian, translated from the draft's own dictionaries. Program pages and The Art of Prayer are English only.

---

Current 1.8.0 refinement: on-site Daily Rosary & Mass player, seven authentic family hero photographs, a different festival age-range photo, continuous homepage Rosary photo bleed, topic-photography podcast covers, cleaner filmed conversations, blended genuine crucifix artwork and a compact footer with social icons. See the dated live-and-artwork task folder for actual checks and provider limitations.

# Family Rosary proposal 1.8.0

Public review: https://emmanuelepau.github.io/family-rosary-proposal/ . This is a proposal, not the ministry production website. Review pages retain noindex.

## Current corrections

The committee corrective pass starts from5f6b9a6 (1.6.2). It preserves57unique programs and54resources, including48saved legacy resources. Direct video/audio playback, actual guest photography, cleaner cards, overlaid navigation, rotating features, player-first dialogs, audio recovery and compact glass controls remain in place. Prayer entry routes, age-tab progress, phone bead/reader transitions, optional Fatima prayer words, resource filters, focus contrast and image payloads were corrected in1.7.0.

Each program now has substantive initial HTML with its source description, credits and related programs. Reviewed transcripts are not fabricated. Native WordPress includes57program patterns, a dedicated page-program template and an explicitly invoked WP-CLI seed helper. Activation does not create posts; existing customized pages are preserved.

The1.7.1 subscription links use the dedicated Family Rosary blog signup with Daily/Weekly choices. The1.7.2 wording accurately offers new blog reflections and daily notifications or a weekly digest. It does not promise fresh resources every day or guaranteed calendar-day delivery. HubSpot form/workflow and sent-history inspection were read-only; no email, form or subscription setting was changed and no test subscription was submitted.

Resource language metadata now includes original-body evidence for16PDFs and reviewed English landing-page evidence for7more resources. Seven media languages remain unclassified. Selected resources include supported participation cues; the dated paper-chain calendar is explicitly flagged. Four age-specific links open the on-site prayer plans.

## Build and package

Run npm ci, then npm run build. Source lives in wordpress/family-rosary, media/resource metadata in content, and generators in scripts. The build exports docs and creates docs/downloads/family-rosary-theme-1.8.0.zip. Historical packages are retained. Assets and their rights are recorded in wordpress/family-rosary/ASSET-CREDITS.md. Font binaries are not redistributed.

## Verification

Build, syntax checks and both Rosary structural checks pass. The model has59beads (53HailMary,6OurFather), the correct1/3/1openingstrand and77prayerstages. Deterministic geometry checks do not constitute ecclesiastical certification.

The1.7.0–1.7.1 corrective build was inspected in the internal browser across8routes at1280/390px, with no horizontal overflow or broken loaded images in those observations. Sampled direct video, video switching, audio start/pause/stop, standalone program playback and age-progress retention were exercised. Native WordPress validation covered82documents/513blocks with0invalid blocks. Package/source parity was checked. The1.7.2contentfollow-up is verified separately in the task delivery notes.

The external-Chrome/axe suite was not run under the user's internal-browser-only instruction. A historical npm check failure is not reported as passed. No physical-device, screen-reader, physical-print, field-performance or complete57programplaythrough claim is made.

The1.8.0 build and full unit suite pass. Fresh native WordPress parsing:82documents/473blocks,0invalid. Internal-browser playback showed the actual November10Rosary live on the website, including390px phone. Escape removed its frame and returned focus. New topic-photo cards, four actual session cutouts, family crops and compact footer were visually checked. See task evidence for the exact scope.

## Remaining limits

Daily prayer uses verified dated stream IDs with automatic expiry. YouTube’s stable channel embed failed even while the dated live Rosary played. Future daily broadcasts require a maintained schedule or supported automated source; this release does not claim automatic future-day discovery.

Broader editorial work remains: reviewed transcripts/caption inventory,7unclassified media languages, additional source photo curation, a sharper crucifix photograph and further source-poster art direction. The Rosary is structurally accurate and stylized, not a photorealistic crucifix. Exact remembered baby/Canto selections remain open. The original Rosaryin25Days destination requires further publisher clarification; its current destination is disclosed. Production redirects/canonicals, indexability, policy and ministry review are separate from this proposal. No ranking or engagement improvement is certified.

Independent committee findings, source receipts, release identifiers and actual live checks are maintained in the dated task folder. This scoped corrective release does not claim the entire broader creative brief is finished.
