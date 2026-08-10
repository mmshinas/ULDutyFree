# Serendib Treasures — Inflight Duty-Free Catalog & Sales App

A single-file, fully offline progressive web app (PWA) for SriLankan Airlines cabin
crew to browse the inflight duty-free catalog, manage opening stock per flight,
record passenger and crew sales, and generate a printable/PDF flight report —
all without a backend or internet connection.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire application — markup, styles, catalog data (112 items), and all logic. Self-contained; no external requests are made at runtime. |
| `manifest.json` | PWA manifest (name, icons, display mode) so the app can be installed to a device home screen. |
| `sw.js` | Service worker that caches the app shell for offline use. |
| `icon-192.png`, `icon-512.png` | App icon, standard. |
| `icon-192-maskable.png`, `icon-512-maskable.png` | App icon, maskable variant (safe-zone padding so Android doesn't crop it awkwardly when applying its own shape mask). |

The one decorative image inside the app (the peacock feather in the header) is
embedded directly in `index.html` as a base64 data URI, keeping the app itself
a single portable file — only the installable-icon PNGs above are separate
files, since app manifests require real icon files rather than embedded ones
for reliable install prompts across browsers.

## Running locally

No build step is required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder with any static file server, e.g.:
  ```bash
  npx serve .
  # or
  python3 -m http.server 8000
  ```

Serving over HTTP(S) (rather than `file://`) is required for the service
worker (offline caching) and "Add to Home Screen" install prompt to work.

## Deploying with GitHub Pages

1. Push all the files listed above to the root of a GitHub repository (or to
   a `/docs` folder, or a `gh-pages` branch — whichever you prefer).
2. In the repo settings, enable **GitHub Pages** and point it at that
   location.
3. Visit the published URL.

## Installing as an app (PWA)

Visit the deployed URL in a mobile browser, then:
- **Android (Chrome)** — tap the install prompt, or menu → "Install app" / "Add to Home Screen".
- **iOS (Safari)** — tap the Share icon → "Add to Home Screen".

Once installed it opens full-screen with its own icon, and works offline
after the first load thanks to the service worker.

## Item thumbnail photos

Item photos crew add while using the app (tap an item's photo → upload) are
stored in the browser's `localStorage` on that specific device — they are
**not** part of this repository and don't sync anywhere by default. If you
want the same photos to show for every visitor of the deployed site, use the
in-app **Open Flight → Export Photos for GitHub** button (only appears once
at least one photo has been uploaded on that device). It downloads a
**`serendib-photos-update.zip`** containing:

- an `images/` folder with each photo as its own file (`images/<item-code>.jpg`)
- an updated `index.html` whose catalog data references those files by path

Unzip it and upload both the `images/` folder and the updated `index.html`
to this repo (overwriting the existing `index.html`), and every visitor will
see those photos.

### How photo caching works on visitors' devices

- The service worker caches each photo the first time it's requested, in a
  cache that's kept **separate** from the app itself.
- Unchanged photos are never re-downloaded, even when you push app updates —
  they're already cached under the same file path, so the service worker
  serves them straight from local storage with no network request at all.
- If you replace a photo later, give the new file a different name (or add
  an item and re-run the export, which always names files by item code) so
  its URL actually changes — that's what tells a device "this one's new,
  fetch it." Reusing the exact same filename for different image content
  won't automatically update devices that already cached the old one.
- The app also proactively fetches every bundled photo once, right after it
  loads (while online), rather than waiting for each item to be opened —
  so by the time a device goes offline, everything's already cached.

## Data & storage

Everything the app remembers is stored locally in the browser's
`localStorage` on the device it's used on:

- Catalog item thumbnails
- Opening stock counts and flight details (date, flight number, sector, CSS
  staff no, CSS name)
- The current cart and sales log
- Archived (closed) flight summaries and their stock reconciliation reports

Since there's no backend, this data does not sync between devices — each
phone/tablet the app is installed on keeps its own local history.

## Key workflows

- **Open Flight** — enter Date, Flight Number, Sector, CSS Staff No, CSS
  Name, and opening stock per item. Selling is disabled until all of these
  are filled in.
- **Sell** — browse or search the catalog, open an item, choose a quantity
  and price tier (Listed / Special / Crew), add to cart. A single cart
  cannot mix passenger and crew sales.
- **Cart → Complete Sale** — deducts sold quantities from stock and records
  the sale.
- **Session (Close Flight)** — view the current flight's passenger/crew
  sales breakdown, download a printable report (opening stock, sales,
  closing stock, totals), and close the flight to archive it and reset
  stock for the next leg. Past closed flights remain browsable and their
  reports stay downloadable even after closing.
