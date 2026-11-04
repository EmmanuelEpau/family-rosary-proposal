# Family Rosary WordPress theme

This is a standalone native WordPress block-theme proposal for a future migration from the current HubSpot site. It does not deploy, migrate HubSpot content, or change production. No page builder or theme plugin is required.

## Requirements and installation

- WordPress 6.6 or newer; PHP 7.4 or newer. Use the supported versions provided by the eventual host. Runtime verification below states the versions actually tested.
- Install the complete `family-rosary` folder, including the five bundled patterns and assets, in `wp-content/themes/`, or upload a ZIP with `family-rosary/` as its top-level folder.
- Activate only in an isolated staging site first. Activation registers theme features and assets; it does not create pages, change the homepage setting, import content, submit forms, or change access controls.
- Create pages explicitly, then choose their templates as below. In Settings → Reading, select the intended static homepage. Keep a separate posts page if reflections will use the native posts archive.
- Set the Site Title, Site Logo, navigation destinations, and published page URLs for the staging environment. The starter navigation uses the public-site paths listed below. It cannot make missing pages exist.

## Where editors make changes

| Area | Native editing surface |
|---|---|
| Homepage presentation | Appearance → Editor → Templates → Front Page |
| Rosary guide presentation | Appearance → Editor → Templates → Rosary guide |
| Resource presentation | Appearance → Editor → Templates → Family prayer resources |
| Watch & Listen presentation | Appearance → Editor → Templates → Watch & Listen |
| Story presentation | Appearance → Editor → Templates → Our story |
| Header, footer, menus | Appearance → Editor → Patterns → Template Parts / Navigation |
| Global colors and typography | Appearance → Editor → Styles |
| Ordinary pages and reflection articles | Pages / Posts editor; the default Page and Single templates render that content |
| Reusable starting layouts | Block inserter → Patterns → Family Rosary |

The five presentation templates reference bundled block patterns. Their text and blocks are edited in the **Site Editor template**, rather than the assigned page's body field. This deliberately makes the design available immediately without activation-time database writes. For a production workflow that expects routine edits in the Pages editor, copy the pattern into page content and use a content-rendering template; avoid keeping duplicate copies in both locations. Decide that editorial model during handover.

The guided-prayer controls, filters, and media dialog use Custom HTML blocks with the bundled JavaScript. Those controls are not separate custom Gutenberg blocks. The curated media catalog is rendered into the media pattern; this proposal does not import a podcast feed or create a media content type. Routine media updates need the agreed pattern/catalog editing workflow.

Saved Site Editor changes live in the database and override theme files. Updating this theme ZIP does not overwrite those customizations. Export and review them before a later release; resetting a template removes its saved customization.

## Template and pattern map

| Template file | Pattern or behavior | Suggested page URL |
|---|---|---|
| `front-page.html` | `family-rosary/home` | Site homepage |
| `page-rosary.html` | `family-rosary/rosary-guide` | `/how-to-pray-the-rosary/` |
| `page-resources.html` | `family-rosary/resources` | `/prayerresources/` |
| `page-media.html` | `family-rosary/media` | `/watch-and-listen/` |
| `page-story.html` | `family-rosary/story` | `/our-story/` |
| `page.html` | Native page title and post content | Other pages |
| `single.html` | Native title, date, featured image, content, categories | Reflection articles |
| `index.html` | Inherited native post query with pagination | Posts page and fallback |
| `archive.html` | Archive title, description, inherited query | Category/date archives |
| `search.html` | Native search form, query, pagination, no-results state | Search |
| `404.html` | Search and helpful navigation | Missing URLs |

The custom templates are registered for pages in `theme.json`. Assign them in the page settings; a page need not have a matching filename/slug to use them. The suggested page URLs are starter destinations, not a completed migration map.

## Structure and assets

- `style.css` contains WordPress theme metadata only.
- `theme.json` supplies native editor settings, styles, template names, and the palette: royal `#0047BA`, gold `#85754E`, dark `#142c2b`, parchment `#f7f5ef`, and white.
- `functions.php` enqueues `assets/site.css` and deferred `assets/site.js`, adds editor CSS, and registers the pattern category.
- `parts/header.html` and `parts/footer.html` use native Group, Columns, Site Logo, Heading, Paragraph, and Navigation blocks.
- The Site Logo block renders `assets/logo.svg` as a fallback until an editor chooses a logo. It does not enable arbitrary SVG uploads. The fallback is a theme asset, not a Media Library attachment.
- Starter native navigation URLs are resolved through WordPress `home_url()` for subdirectory installations. Editor-entered absolute URLs remain unchanged. Review all content links when assigning final URLs.
- Presentation templates own the single main landmark; patterns should not add nested main elements.
- Newsreader and Source Sans 3 are proposed open-font substitutes. They are not the approved Whitney/Calluna brand font files. The asset package must carry its font licenses.
- The Live Mass & Rosary starter button links to the verified Family Rosary YouTube streams page. It names the program; it does not claim a stream is live now.
- Core WordPress handles the native mobile navigation. The static-preview navigation adapter is a separate preview concern.

## Validation

The theme has activated in official WordPress Playground with WordPress 7.1.4 and PHP 8.3.36. Activation registered the block theme and custom templates without creating posts/pages. The JSON configuration validates against the official WordPress 6.6 schema. The task-local QA runtime is outside the distributable theme because no system PHP, Docker, or WP-CLI installation was available.

The completed integrated run passed 12 content routes: all five presentation pages, default page body, reflection article body, posts archive, category archive, search/no-results, and a true 404 response. The three bundled asset requests also passed. WordPress’s own PHP block parser and browser editor parser validated all 321 blocks across 18 template/part/pattern documents, with zero invalid blocks. The starter navigation passed a simulated subdirectory-home check and preserved external URLs. Evidence is recorded in the task’s `qa/runtime/wordpress-validation-results.json` and `wordpress-block-validation.json`.

A 390px browser check passed on all five presentation pages: no horizontal overflow and a visible live-prayer link. Native navigation opens, exposes its links, and closes with Escape. The media page rendered 44 cards, returned the search empty state, and opened/closed the media dialog. The desktop homepage capture is `qa/runtime/wordpress-home-desktop.png`.

These checks validate rendering and block serialization, not a completed Site Editor save/restore workflow, live third-party playback, all supported WordPress/PHP versions, or a production migration. Final visual and content review remains part of the parent delivery.

The standalone static preview demonstrates visual content. It is not evidence that WordPress activated or that block editing, forms, search, media, or third-party integrations work. Verify those in WordPress staging.

## Migration and release limits

Inventory HubSpot pages, PDFs, images, downloads, existing links, and search landing pages before URL changes. Preserve valuable URLs where practical; map changed URLs to relevant permanent redirects and update internal links, canonicals, language alternates, and sitemaps. Do not replace all old URLs with a homepage redirect.

This theme does not supply a migration, SEO, translation, analytics, caching, donation, newsletter, or prayer-request backend. Review the complete patterns for any links to existing services. Keep existing approved services until their replacement is configured and tested. Do not imply a form submission or donation works without verifying the actual destination.

Before a release: review pastoral content, media/font rights and alternative text; verify navigation and all downloads; test keyboard/mobile behavior; connect site search to real content; confirm dates and live-prayer schedules; check indexing/redirects; and perform a content-owner review. This is a design and implementation proposal, not a production-ready migration sign-off.

## Official implementation references

Reviewed on 4 November 2026:

- [Block-theme structure](https://developer.wordpress.org/themes/core-concepts/theme-structure/)
- [Templates and saved-template precedence](https://developer.wordpress.org/themes/templates/templates/)
- [Custom templates in theme.json](https://developer.wordpress.org/themes/global-settings-and-styles/custom-templates/)
- [theme.json version 3](https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/theme-json-living/)
- [Registering theme patterns](https://developer.wordpress.org/themes/patterns/registering-patterns/)
- [Including theme assets](https://developer.wordpress.org/themes/core-concepts/including-assets/)
- [Official Playground CLI](https://developer.wordpress.org/playground/developers/local-development/wp-playground-cli/)

