# Changelog

All notable changes to Scripture Mastery are recorded here, newest first.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Added

- **App icon** ([#7]). The "Blade on the page" mark (design 2a) — a paper ribbon
  marker on a steel field with the sword of Hebrews 4:12 struck through it.
  Shipped in two cuts, since the design gives small sizes their own treatment:
  `favicon.svg` widens the blade and drops the passage rules that turn to mush
  in a browser tab, while `icon.svg` keeps the full detail for app tiles.
  Adds `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, and a web
  manifest, so the app installs with a real icon rather than a blank tile.
  Colours are the app's existing tokens (`--color-accent-900` steel,
  `--color-bg` paper, `--color-accent` rules), written as literals because an
  SVG loaded as a favicon never sees the document's custom properties.

[#7]: https://github.com/godwinlaw/scripture-mastery/issues/7
