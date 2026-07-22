# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mobile-first website **and installable PWA** for St. Anthony the Great Orthodox Christian Church (Antiochian Archdiocese) in Spring, TX. Plain HTML/CSS/JS — **no build step, no framework, no package manager, no dependencies, no tests**. The repo root is the publish directory; deployment is GitHub Pages (managed branch deploy from `main`, `.nojekyll` included).

## Commands

```bash
# Local preview (only command there is — nothing to build, lint, or test)
python3 -m http.server 8080
```

Service-worker behavior doesn't run from `file:` URLs, so always preview over HTTP.

## Architecture

### One config object drives every page

`assets/js/config.js` defines the global `window.PARISH` — all parish-editable data: contact info, office hours, weekly service times, PayPal giving, form endpoints, ministries, social links. Every page reads from it; the parish office edits **only this file**. Keep it that way:

- New feature data belongs in `config.js`, not hardcoded in HTML/JS.
- Keep the file heavily commented and plain-values-only — non-developers edit it.
- **Empty string = feature off, with graceful fallback.** This is a core design principle ("nothing is ever silently dropped"): no PayPal ID → Give page shows a friendly "nearly ready" state; no form endpoint → forms fall back to `mailto:` (if `email` is set) or show the office phone. Preserve this pattern when adding anything configurable.

### Script pattern: IIFEs + globals, strict load order

There are no modules or bundler. Each JS file is an IIFE exposing a global. Every page loads, deferred and **in this order**: `config.js` (→ `window.PARISH`) → `liturgical.js` (→ `window.Liturgical`) → `main.js` (shared logic; also defines `window.toast`). Pages with extra behavior add their own script after: `give.js` on give.html, `connect.js` on connect.html. New pages must replicate this block.

### Widgets bind via data attributes; HTML carries static fallbacks

`main.js` renders into declarative hooks found on any page: `[data-next-service]` (live countdown card), `[data-schedule]` (weekly table body), `[data-feasts="N"]` (next N liturgical days), `[data-today]`, `[data-year]`, `[data-phone]`, `[data-directions]` (Google Maps link from `address.mapQuery`), `[data-install]` (PWA install button), `[data-share]`, and `.reveal` (scroll-in animation). The HTML inside these hooks is real content (e.g. hardcoded schedule rows) that JS replaces at runtime, plus `<noscript>` blocks — progressive enhancement so pages degrade sensibly. Keep static fallback content in sync when changing the schedule in `config.js`.

### Liturgical calendar is computed, never maintained

`assets/js/liturgical.js` computes Orthodox Pascha (Julian computus projected to Gregorian, +13 days, valid 1900–2099) and derives the movable cycle from it; fixed feasts follow the New (Revised Julian) Calendar used by the Antiochian Archdiocese. There is deliberately **no annual data to update** — don't add hardcoded feast dates for specific years. Feast `kind` values (`pascha`, `patronal`, `great`, `fast`, `season`, `feast`) map to badge styles in `main.js`'s `renderFeasts`.

### Time zones are handled explicitly

Service times in `config.js` are wall-clock `America/Chicago` (`day` 0–6 + 24h `"HH:MM"`). `main.js` converts wall time → UTC instant via a two-pass DST-safe routine (`zonedToUtc`) using `Intl.DateTimeFormat`, so countdowns are correct for viewers in any time zone. Don't replace this with naive `new Date(y, m, d, h)` local-time math.

### Service worker: version bump is part of every change

`sw.js` caching strategy:
- **Network-first**: page navigations and `config.js` — so schedule/giving edits reach installed apps immediately, with cache fallback offline (`offline.html` for navigations).
- **Cache-first with background refresh**: all other same-origin static assets.
- Cross-origin requests (PayPal etc.) are never intercepted.

Two maintenance rules:
1. **After any file edit, bump `VERSION` in `sw.js`** (`stanthony-v1.0.1` → `v1.0.2`) so installed apps drop stale caches.
2. **New files/pages must be added to the `PRECACHE` list** or they won't work offline.

### Pages duplicate their chrome — changes fan out

There is no templating: each of the six pages (`index`, `visit`, `about`, `services`, `give`, `connect`) carries its own copy of the `<head>` boilerplate, header/top-nav, footer, and bottom tab bar. A change to shared chrome must be replicated across **all** pages, including `aria-current="page"` on the correct top-nav *and* tab-bar link per page. Adding a page also means updating: nav on every page, `sw.js` PRECACHE, `sitemap.xml`, and (if appropriate) `manifest.webmanifest` shortcuts.

### Payments never touch this site

`give.js` only constructs PayPal donate **URLs** (hosted button ID preferred — supports PayPal's monthly option; `businessEmail` fallback passes the fund through as `item_name`). No card data, no payment SDK, no secrets in the repo. Keep it that way.

## Conventions

- **All paths are relative** (`./assets/...`) so the site works from a subpath during testing. Never introduce root-absolute paths.
- Mobile-first CSS in the single `assets/css/main.css`: design tokens as custom properties at the top, dark mode via `prefers-color-scheme` only (no toggle), `prefers-reduced-motion` respected, tab bar shows <900px / top nav ≥900px. Style with the existing tokens (`--accent`, `--surface-2`, etc.), not raw colors.
- Accessibility patterns in use everywhere: skip link, `aria-label` on nav/icon links, `aria-pressed` for toggle buttons, `scope="row"` on table headers, `rel="noopener"` on external links, meaningful `alt` text. Match them in new markup.
- Each page has its own `<title>`, `meta description`, and OG tags; `index.html` carries schema.org `Church` JSON-LD. Update these when page content changes meaningfully.
- Tone of user-facing copy is warm, plain-spoken, and welcoming to newcomers (see `visit.html`); parish facts came from public listings — the README asks the office to verify them, so don't invent new facts.
