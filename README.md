# Family Rosary website proposal

[Open the review website](https://emmanuelepau.github.io/family-rosary-proposal/)

Version 1.1.0, redesigned November 9, 2026 from HCFM.org’s established identity at Emmy’s request. White reading surfaces, exact HCFM blue, black media areas, restrained gold accents, Whitney display/navigation, Calluna reading and brief PlaylistScript accents. The actual Family Rosary logo is unchanged. Supersedes the rejected cream/green/brown direction.

Five connected pages: home, Rosary guide, prayer resources, Watch & Listen and our story. Prayer walkthrough, resource filters and 44 media entries (35 currently listed podcasts and nine selected videos). This is a proposal, not the complete historic archive or a production migration.

## Source and build

Base commit: ec51442d82a3161047664731c5d9b65d308c1ca8. Native WordPress patterns and parts are canonical in wordpress/family-rosary; docs is their static review export. Run npm ci, then npm run build. The build packages downloads/family-rosary-theme-1.1.0.zip. Catalog JSON is a source record, not an automatic publishing feed.

## Fresh verification, November 9

In-app browser: 20 static route/width checks (1440, 768, 390, 320), no document overflow and one H1 each; 10 local WordPress desktop/phone route checks, one main and H1 each. WordPress’s actual editor parser: 338 blocks, 18 documents, zero invalid blocks. Guided decade completion/reset, resource query/empty/reset, phone menu/Escape, all 44 media dialogs and explicit YouTube mount/unload checked. All media artwork finished loading without a broken image in the exercised library. Independent visual/code review: ship the nonproduction proposal after gutter/evidence fixes. Source whitespace and JavaScript syntax checks passed.

The existing npm run check launches an external browser and was not rerun after the user required in-app browser use. Historical accessibility scans are not fresh scans. Continuous media playback and ordinary-editor save/reopen are not certified. Research notes and detailed evidence are kept separately in the dated task folder, not on the visitor-facing website.

## Limits

Current ministry site remains unchanged. Current HubSpot content/URLs, PDFs, QR destinations and archives require a reviewed migration map before any separately authorized production release. No accounts, fake submissions or live-status claims added. Public review retains noindex and proposal notice. Font files are referenced through existing HCFM delivery and not redistributed; final production delivery and image rights require confirmation. No ranking, traffic or AI-citation guarantee.

Theme code GPL-2.0-or-later; photographs, marks and media remain their owners’ material. See the theme ASSET-CREDITS.md.
