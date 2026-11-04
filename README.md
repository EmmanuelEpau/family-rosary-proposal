# Family Rosary website proposal

[Open the review website](https://emmanuelepau.github.io/family-rosary-proposal/)

Five connected pages: home, Rosary guide, prayer resources, Watch & Listen, and our story. Includes a guided decade, resource filters, media search, browsing rows and players. Daily Mass/Rosary remains visible on phones.

The library contains 35 episodes currently listed on two active podcast series pages and nine selected videos. It is not the complete historical archive. External players load only after a visitor chooses to load them.

## WordPress and preview

`wordpress/family-rosary/` is a native block theme; `docs/` is its static GitHub Pages counterpart. Follow the theme README-WORDPRESS.md for installation and page/template assignment. Current Family Rosary is hosted on HubSpot; WordPress is the requested future target, not a completed migration.

Run `npm install`, `npm run build`, then `npm run check`. Requires Python 3, Node.js and installed Google Chrome. Theme patterns and parts are canonical. The catalog JSON is a source record, not an automatic publishing feed.

## Validation and limits

Theme activated in WordPress Playground 7.1.4 / PHP 8.3.36. Twelve routes passed; 321 blocks across 18 documents validated. Static checks cover five pages at four viewport sizes, accessibility scans and prayer/resource/media interactions. Continuous playback of all media, every runtime version and editor save/restore are not certified.

Proposal only. The live site remains unchanged. Donations, prayer requests and deeper resources open existing ministry services. No fake submissions or accounts. All preview pages carry noindex and a proposal notice. Research and account evidence stay separate.

Before production: editorial and image-rights approval, full migration/redirect mapping, hosting and integration setup. Search rankings are not guaranteed.

New standalone repository; no inherited base commit. Theme code GPL-2.0-or-later; fonts retain SIL OFL licenses. Ministry images and marks retain their owners’ rights; see ASSET-CREDITS.md.
