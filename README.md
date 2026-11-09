# Family Rosary website proposal

[Open the review website](https://emmanuelepau.github.io/family-rosary-proposal/)

Version 1.4.0, 9 November 2026. The five-page WordPress proposal follows HCFM.org's identity: white reading and browsing surfaces, HCFM blue, selective yellow, Whitney/Calluna typography and the actual Family Rosary logo. This release adds program-led streaming discovery and the exact Children's Storybooks image Emmy selected from the Canva concept.

## What changed

- Home and Watch & Listen feature four editorial selections in a 9-second carousel with named selectors, previous/next and Pause/Resume. Manual selection and keyboard entry stop rotation; pointer hover, background/offscreen state and an open player pause it. Reduced-motion preference starts paused. Video/audio does not autoplay.
- Actual program artwork replaces the generic media hero. Shelves separate the four popular Rosary films, short reflections, beginner prayer videos, dated recorded community prayer and two podcast series.
- The four leading videos in the official channel's Videos>Popular list show real YouTube views, checked 9 November 2026: Joyful 2,663,055; Glorious 2,392,498; Sorrowful 2,061,636; Luminous 1,107,584. Counts are views, not unique people/families, and are dated snapshots. No invented ratings, matches or likes.
- All 44 existing media records remain; the Sorrowful and Luminous films bring the library to 46 programs (11 videos, 35 podcast episodes). Twelve native resource cards and four flexible child-age pathways remain.
- The exact child-reading image leads the children's invitation on home/resources, with actual Companion and Gospel-activity destinations. Canva itself was not edited. Asset identity and remaining production licensing requirements are in the theme's ASSET-CREDITS.md.

## Source and build

Repository: EmmanuelEpau/family-rosary-proposal. Revision base 1705086. Earlier bases 99e43a4, 736460f and ec51442. Canonical native patterns/parts are in wordpress/family-rosary; docs is their static review export. Run npm ci and npm run build. The build emits downloads/family-rosary-theme-1.4.0.zip and content-hashed asset URLs plus release identifiers on internal preview links, so entering through a fresh versioned review link keeps subsequent navigation on this release. Previously loaded tabs need that fresh link or a refresh. Catalog JSON is a source record, not an automatic publishing feed.

## Verification

Internal-browser checks: 40 route/width combinations (all five pages at 320, 390, 768, 781, 1024, 1440, 2560, 3440), no horizontal overflow and oneH1; initial and manual transition frames also fit on phone/tablet after containing the slide animation. Actual WordPress editor parser: 563 blocks, 18 documents, zero invalid blocks. Carousel automatic advance, manual selection/pause, player entry and visible focus return, media format counts 11/35/46, search empty/reset and existing family resource filtering were exercised. JavaScript syntax, whitespace and static build pass. Independent source/visual review findings were resolved.

The retained npm run check opens an external browser and was not run under the internal-browser-only instruction. Its updated 46-program selectors/counts are maintained for future use. Reduced-motion behavior was inspected in source, not emulated in the internal browser. Full accessibility certification, ordinary-editor save/reopen, complete provider playback, production licensing and migration are not certified. Detailed evidence/research stays in the dated task folder, not the visitor-facing proposal.

## Limits

Only the public review proposal is released. The live ministry site, HubSpot content and Canva design remain unchanged. Existing pages/PDFs/QR destinations need a reviewed migration map before a separately authorized production release. No accounts, fake submissions, live-status claims or recommendation algorithms were added. The proposal retains noindex and its review notice. No traffic, ranking or engagement lift is guaranteed.

Theme code GPL-2.0-or-later; photographs, marks and media retain their owners' rights. Fonts use existing HCFM delivery and are not redistributed.
