# Family Rosary website proposal

Version 1.6.0 working revision, 9 November 2026. Eight on-site routes, 54 resource cards and 57 unique media programs, built with HCFM’s Whitney, Calluna and PlaylistScript typography and official Family Rosary marks. This revision is prepared and locally verified; publication of 1.6.0 is not claimed here. The ministry website is unchanged.

[Public review website — check its displayed version](https://emmanuelepau.github.io/family-rosary-proposal/)

## Current revision

- Eight routes cover home, the complete interactive Rosary, the readable/printable prayer guide, resources, Watch & Listen, Father Peyton’s story, the Family Rosary Companion and family prayer by age.
- The library renders all 48 observed legacy resources plus six distinct existing additions. Search, topic, format, confirmed-language and section filters work with 12-at-a-time expansion, counts, empty/reset states and preserved deep anchors. Unknown language is explicit; PDF language is not guessed. Root’s internal-browser observations resolved all 48 original destination paths; navigation evidence does not establish file contents, media playback or HTTP status.
- Companion offers an on-site family prayer activity and eight direct English/Spanish mystery PDFs. Family prayer by age offers immediate activities for babies/preschoolers, primary-school children, preteens and teenagers. The original Navigating Prayer Time PDF remains separately labeled. The print guide includes direct Español and Português PDFs alongside readable English prayer words.
- Watch & Listen contains **57 unique programs**: 22 original video records and 35 podcasts. Four verified filmed podcast editions also appear in the video filter, giving **26 video results and 35 podcast results with an overlap of four**. Four actual conversation frames and eight source-portrait crops distinguish How’s Your Prayer Life? episodes; 23 native Through the Mysteries compositions retain the magnifying-glass identity. Original official covers and publisher sources remain available.
- Selecting a media card opens its video player or audio dock directly; separate details actions open editorial information. The audio dock supports continued browsing on the current page. Cross-page audio continuity is not implemented. Video providers unload when the dialog closes; provider playback remains subject to network and embedding restrictions.
- The Rosary journey has 77 navigable stages from the cross and opening prayers through all five decades and closing prayers. Deterministic geometry retains 59 beads: 53 Hail Mary and six Our Father. Readable prayer words and accessible controls accompany the model. Structural checks are not ecclesiastical certification.
- Homepage photography uses six real ministry photographs from the St. Bernadette collections, with stable copy during photo rotation. Footer routes include subscription, ministry support, Mass intentions, blog/reflections, social accounts and clearly labeled Facebook prayer communities. Source and licensing notes are in wordpress/family-rosary/ASSET-CREDITS.md.

## Source and build

Repository: EmmanuelEpau/family-rosary-proposal. Baseline commit: 5cdba2cec3493573466e811be180d3001278180c. Development is isolated in the dated task-folder clone. Native WordPress patterns, parts and assets are in wordpress/family-rosary; docs is their static review export.

Run `npm ci`, then `npm run build`. The build bundles the Rosary, regenerates media and resource patterns, exports eight routes and creates downloads/family-rosary-theme-1.6.0.zip. Historical packages remain. Resource destinations and verified editorial overrides are in content/resource-destinations.json; scripts/build-resources.py preserves the original resource identities and routes internal links through WordPress’s home_url helper. Edit media metadata in content/media.json; generated pattern edits must be made in their generator. Three.js/esbuild versions are pinned and upstream notices retained.

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
