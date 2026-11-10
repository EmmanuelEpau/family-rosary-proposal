Newsletter follow-up: HubSpot verified FR | FRBlog Subscribe, form257952a0-7366-4f80-856e-dc0bef6d1ae7, published public Daily/Weekly choices and active [FR] Blog Subscribe workflow. All proposal newsletter CTAs now use that exact World at Prayer form, not the separate general email-updates form. Actual daily/Wednesdayweekly records were read; no HubSpot settings changed or signup submitted.

# Current proposal:1.7.1 committee corrections

10 November2026. The1.7.0 pass repairs media playback recovery, full-height interview composition, player-first dialogs, larger guest artwork, prayer entry routes, age progress, optional Fatima words, phone bead/reader transitions, focus contrast, resource filters and program discovery. It retains all48saved legacy resources within54records and57unique programs.

The static proposal and native package now contain57program detail documents. Native patterns and a dedicated page-program template are included; run tools/seed-programs.php explicitly with WP-CLI only in the intended installation. Activation never creates posts. The helper preserves existing pages; the main8pages still follow the installation guide. No ministry production installation was changed.

Checks: build, Python/JavaScript syntax, two structural Rosary checks; internal-browser8routes at1280/390, nooverflow/brokenloadedimages andoneH1; actualdirectvideo, episode switch, audio start/pause/stop; age-tab progress; native82documents513blocks0invalid; nativeprogramoneH1andplayingvideo; standaloneaudiooneclick advancing. Full external-Chrome/axe suite not run under user's internal-browser restriction. Historical failed suite remains historical, not passed.

Editorial/source work remains open: reviewed transcripts, unclassified resource languages, exact remembered baby/Canto selections, sharper crucifix photo, fully art-directed remaining source posters, and broader source curation. Production migration/policy/field performance and human/ministry approval are separate from this proposal. See task FINDINGS.md and reviews for the full honest ledger. Do not call the entire broader brief finished.

---

# Family Rosary website proposal

Version 1.6.2 review revision, 9 November 2026. Eight on-site routes, 54 resource cards and 57 unique media programs, built with HCFM’s Whitney, Calluna and PlaylistScript typography and official Family Rosary marks. This revision is locally verified; publication and live-check results are recorded separately in the task delivery notes. The ministry website is unchanged.

[Public review website — check its displayed version](https://emmanuelepau.github.io/family-rosary-proposal/)

## Watch & Listen refinement

The published 1.6.1 pass removes per-card information icons and repeated format captions, preserves direct playback and real guests, unifies podcast headers, repairs numberless episode-row placement, and uses a genuine ministry crucifix photograph for Sign of the Cross. The opening now bleeds beneath the ministry strip with overlaid navigation and bounded muted excerpts from the original videos. Posters remain available when previews are blocked or paused; provider behavior and advertising are outside the site’s control. The audio player exposes episode details from its controls instead of every thumbnail.

Homepage photo rotation/crops, other homepage artwork, footer, story layout and resource-gallery annotations remain separate follow-through tasks after this Watch & Listen pass.

## Current revision

- Eight routes cover home, the complete interactive Rosary, the readable/printable prayer guide, resources, Watch & Listen, Father Peyton’s story, the Family Rosary Companion and family prayer by age.
- The library renders all 48 observed legacy resources plus six distinct existing additions. Search, topic, format, confirmed-language and section filters work with 12-at-a-time expansion, counts, empty/reset states and preserved deep anchors. Unknown language is explicit; PDF language is not guessed. Root’s internal-browser observations resolved all 48 original destination paths; navigation evidence does not establish file contents, media playback or HTTP status.
- Companion offers an on-site family prayer activity and eight direct English/Spanish mystery PDFs. Family prayer by age offers immediate activities for babies/preschoolers, primary-school children, preteens and teenagers. The original Navigating Prayer Time PDF remains separately labeled. The print guide includes direct Español and Português PDFs alongside readable English prayer words.
- Watch & Listen contains **57 unique programs**: 22 original video records and 35 podcasts. Four verified filmed podcast editions also appear in the video filter, giving **26 video results and 35 podcast results with an overlap of four**. Four actual conversation frames and eight source-portrait crops distinguish How’s Your Prayer Life? episodes; 23 native Through the Mysteries compositions retain the magnifying-glass identity. Original official covers and publisher sources remain available.
- Selecting a media card opens its video player or audio dock directly; separate details actions open editorial information. The audio dock supports continued browsing on the current page. Cross-page audio continuity is not implemented. Video providers unload when the dialog closes; provider playback remains subject to network and embedding restrictions.
- The Rosary journey has 77 navigable stages from the cross and opening prayers through all five decades and closing prayers. Deterministic geometry retains 59 beads: 53 Hail Mary and six Our Father. Readable prayer words and accessible controls accompany the model. Structural checks are not ecclesiastical certification.
- Homepage photography combines authentic ministry prayer, All Souls costume portraits, May Crowning and Faith and Family Day photographs, with stable copy during photo rotation. Footer routes include subscription, ministry support, Mass intentions, blog/reflections, social accounts and clearly labeled Facebook prayer communities. Source and licensing notes are in wordpress/family-rosary/ASSET-CREDITS.md.

## Source and build

Repository: EmmanuelEpau/family-rosary-proposal. Baseline commit: 5cdba2cec3493573466e811be180d3001278180c. Development is isolated in the dated task-folder clone. Native WordPress patterns, parts and assets are in wordpress/family-rosary; docs is their static review export.

Run `npm ci`, then `npm run build`. The build bundles the Rosary, regenerates media and resource patterns, exports eight routes and creates downloads/family-rosary-theme-1.6.2.zip. Historical packages remain. Resource destinations and verified editorial overrides are in content/resource-destinations.json; scripts/build-resources.py preserves the original resource identities and routes internal links through WordPress’s home_url helper. Edit media metadata in content/media.json; generated pattern edits must be made in their generator. Three.js/esbuild versions are pinned and upstream notices retained.

## Verification for 1.6.0

- The current build and structural Rosary checks pass. The model checks cover bead counts, opening strand order, decade mappings and loop separators; the journey is additionally exercised from opening to closing.
- Actual WordPress block validation covers **24 documents and 450 blocks, with zero invalid blocks**. This validates parser compatibility, not a complete editor save/reopen cycle.
- Root’s internal-browser checks cover all eight routes at **1280px and 390px**, with no horizontal overflow or broken loaded images in those observations. Saved evidence includes research/committee-v3/v3-desktop-pages.json and v3-phone-pages.json in the task folder. These results do not certify every width, every lazy image or full provider playback.
- Resource generation is idempotent; identity/anchor checks retain all 48 original records and 54 total cards. Source checks require internal routes to use the WordPress helper and confirm the exporter resolves those helpers.
- scripts/check.mjs was updated for eight routes, 54 resources, the 77-stage journey, 57 unique media programs, overlapping format results and native Companion/age routes. It was syntax checked. **The external-browser suite was not run**, under the user’s internal-browser-only instruction; its accessibility scans are not reported as passed.

YouTube and Podbean playback can be limited by provider/network behavior. Observed player mounting, source identity and selected session frames do not prove uninterrupted full viewing/listening. Physical printing, field performance, a complete WordPress editor save/reopen cycle and production reuse licensing remain unverified.

## Search, release and historical context

SEARCH-DISCOVERY.md and the revision’s specialist findings retain the Ahrefs-informed topic ownership and existing URL-preservation requirements. Review pages retain noindex and the proposal notice. Production canonicals, translated equivalents, dedicated indexable watch pages/transcripts, migration redirects and SEO deployment remain separate decisions. No ranking, traffic, AI-citation or engagement improvement is certified.

Version 1.5.0 was the previously released six-route proposal and remains historical baseline evidence. Its earlier browser and block-validation totals describe that version, not this eight-route revision. This README does not claim the public site has received 1.6.0 or that HubSpot, Canva or the ministry production website has been changed. Font binaries are not redistributed; marks, photographs and media retain their owners’ rights.


The 1.6.2 refinement adds genuine All Souls costume portraits and a front-facing May Crowning Marian photograph. Homepage photos advance every five seconds with an 800ms dissolve, individual desktop/phone focal positions and a persistent pause control. Prayer-card photography bleeds to its frame; the home media shelf mixes Rosary, beginner video and conversations. Footer links share one contained grid; story captions align with images and resource cards use consistent art frames and action placement. The current build and source checks pass. Internal-browser checks cover eight routes at1440px and390px, actual direct playback, focused pointer/keyboard photo resume, native WordPress24documents/452blocks/zeroinvalid, and package/source parity. The existing npm check stopped on two unnamed image links; those were fixed and checked in the internal browser, but the full automated/axe suite was not rerun and is not recorded as passed.
