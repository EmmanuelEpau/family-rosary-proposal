# WordPress source checks

The older theme source under `wordpress/family-rosary` is separate from the Draft.11 static preview under `docs`. GitHub Pages serves the latter. The current source cannot rebuild the preview. See the main README for the export's provenance.

Use PHP 8.3 and Composer at the repository root:

```sh
composer install
vendor/bin/phpcs -p
git ls-files -z -- 'wordpress/*.php' | xargs -0 -n1 php -l
```

The ruleset uses WordPress-VIP-Go and PHPCompatibilityWP with PHP 8.3 as the compatibility target. Check the actual staging PHP version before release. The dependency lock pins PHP 8-aware compatibility prereleases compatible with the VIP rules' PHPCS 3 requirement. Composer may warn about the development-only package's unspecified license.

Two line-local PHPCS exceptions identify fixed local JSON reads. No findings are excluded globally.

This branch changes the WordPress source and installs development checks. It does not update `docs`, include a theme ZIP or change hosted WordPress. Human review and private staging checks remain pending.

Pull requests affecting the WordPress source or tooling run the same syntax and PHPCS checks through `Check WordPress source`. The workflow has read-only repository permissions and performs no deployment.
