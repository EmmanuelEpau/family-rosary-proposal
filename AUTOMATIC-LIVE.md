# Automatic daily Rosary and Mass

This implementation is prepared for review. It is not connected to a real API key yet. The current public proposal remains unchanged until the one-time connection is approved and tested.

## Recommended production path: WordPress server lookup

A visitor’s Watch here invitation requests `/wp-json/family-rosary/v1/live`. WordPress uses the official YouTube Data API to discover live/upcoming programs on Family Rosary’s fixed channel, then verifies actual state, date, public visibility and embedding permissions. The browser receives only public video metadata and embeds YouTube on the website.

Set `FR_YOUTUBE_API_KEY` once through the hosting provider’s private environment/secret manager. Restrict the key to YouTube Data API v3; restrict the production server IP when the host provides a stable outbound IP. No YouTube account-management or analytics access is required. Never put a key in theme files, public JavaScript, source control, a chat or the public JSON response.

The server verifies known candidate states once per minute while the site is used. New active broadcasts are discovered at most every five minutes during the daily prayer window; upcoming discovery runs every two hours. Once the scheduled video is known, its actual start/end are checked using videos.list. An active Rosary is retained even after noon or while a second broadcast starts. After it actually ends, the player checks for Mass automatically. It does not switch solely because a clock says noon.

Only today’s Eastern-time programs qualify. Ended, cancelled/private, nonembeddable, unrelated and other-channel videos are excluded. If none is confirmed, families can pray a recording on the site. Temporary metadata outages leave an already-open player usable; fresh visitors never receive expired live metadata. Provider playback restrictions still receive an unavailable/retry/recording recovery path.

Caching and an atomic lock prevent each visitor from spending discovery quota. Failed searches count toward a hard90-per-Pacific-day application ceiling. Google currently documents100search.list calls/day, separate from10000units/day for other endpoints. Quota is shared within a Google project: use a dedicated website project, or explicitly allocate shared quota. Do not run the proposal updater and the production resolver against the same limited project without budgeting both.

## Current static proposal: scheduled publication

GitHub Pages cannot hold a server-side key or perform a private runtime API lookup. The included disabled workflow `.github/workflows/daily-prayer.yml` runs the **same PHP resolver** and publishes only `docs/live/prayer.json`. Native source assets and the packaged theme are not rewritten by routine source refreshes.

One-time setup, after approval:

1. Create a dedicated Family Rosary website Google project and enable YouTube Data API v3, or choose an explicitly allocated existing project. Create one API key restricted to YouTube Data API v3.
2. Store it directly as the repository Actions secret `FR_YOUTUBE_API_KEY`; do not paste it in chat or commit it. Set repository variable `FR_LIVE_AUTOMATION_ENABLED=true` only after the code and connection are reviewed.
3. Merge the prepared branch, manually run Refresh daily prayer broadcasts, verify a real API response and the public JSON’s freshness, then inspect actual on-site playback. No daily ID edits are involved.
4. Observe the next real Rosary-to-Mass transition before treating tomorrow’s service as proven. This cannot be simulated into an operational acceptance claim.

The scheduled prototype checks about every five minutes around the weekday prayer window and hourly otherwise; Pacific-day cache accounting includes failed requests. GitHub cache can be evicted, so this prototype accounting is best-effort; the production WordPress ledger is persistent. Google’s project quota is the upstream ceiling. Source metadata expires after20minutes to cover publishing delay, never across Eastern midnight. A stale or missing update produces recorded-prayer recovery. The native production response expires within60seconds.

GitHub explicitly documents that scheduled jobs can be delayed or dropped, and public-repository schedules can stop after60days without activity. Therefore scheduled Pages updates are a prototype mechanism, not the production availability promise. The WordPress request-time lookup is the recommended production integration. Workflow failures remain visible in GitHub Actions; this implementation does not send staff notifications or change email settings.

## Sources checked in the internal browser

- [YouTube search.list](https://developers.google.com/youtube/v3/docs/search/list): official channel/live/upcoming search.
- [YouTube videos resource](https://developers.google.com/youtube/v3/docs/videos): actual/scheduled times, public state and embeddability.
- [YouTube authentication](https://developers.google.com/youtube/v3/guides/authentication): a public-data API key; no private-channel OAuth required.
- [YouTube quota](https://developers.google.com/youtube/v3/getting-started#quota): current daily buckets.
- [Google API key header](https://docs.cloud.google.com/docs/authentication/api-keys-use): server HTTP header support.
- [GitHub schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule): scheduler limitations.

## Verification boundaries

The JS regressions exercise refresh without remounting, two simultaneous live programs, late Rosary, actual-end handoff, paused-player outages, stale/other-channel rejection, relative source URLs and cleanup. The real PHP implementation was executed under the installed official PHP8.3 runtime with offline HTTP/storage fixtures. Native REST and script URL integration are tested separately. No test credential is a real API key; no fixture is evidence of actual automatic discovery. The final connection still needs one actual successful Google request, public publishing and real playback verification.
