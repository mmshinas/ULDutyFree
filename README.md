# Serendib Treasures — Inflight Duty-Free Catalog & Sales App

A fully offline progressive web app (PWA) for SriLankan Airlines cabin crew
to browse the inflight duty-free catalog, manage opening stock per flight,
record passenger and crew sales, and generate a printable/PDF flight report —
all without a backend or internet connection.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire application — markup, styles, catalog data (112 items), and all logic. No external requests are made at runtime. |
| `manifest.json` | PWA manifest (name, icons, display mode) so the app can be installed to a device home screen. |
| `sw.js` | Service worker that caches the app shell and item photos for offline use. |
| `icon-192.png`, `icon-512.png` | App icon, standard. |
| `icon-192-maskable.png`, `icon-512-maskable.png` | App icon, maskable variant (safe-zone padding so Android doesn't crop it awkwardly when applying its own shape mask). |
| `images/` | Product thumbnail photos, one file per item, named by item code (e.g. `images/D2025070.jpg`). Referenced directly from the catalog data in `index.html`. |

The one decorative image inside the app itself (the peacock feather in the
header) is embedded directly in `index.html` as a base64 data URI. Product
photos are kept as separate real files in `images/` instead, since there are
112 of them — that lets the browser and service worker cache each one
individually and only re-fetch whichever ones actually change, rather than
re-downloading everything on every app update.

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

1. Push **all** the files and folders listed above — including `images/` in
   full — to the root of a GitHub repository (or to a `/docs` folder, or a
   `gh-pages` branch — whichever you prefer). The `images` folder must sit
   at the same level as `index.html`, since photos are referenced by the
   relative path `images/<item-code>.jpg`.
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

Photos are bundled directly into the app as real files in `images/`, named
by item code, and referenced from each item's data in `index.html`. There is
no in-app photo upload feature — photos are provided as files up front and
wired into the catalog data directly, so every visitor sees the same images
with nothing device-specific to manage.

To add or replace a photo: drop a new file into `images/` (following the
same `<item-code>.jpg` naming) and update that item's `"image"` field in the
`itemsData` JSON block inside `index.html` if the filename changed. If you
reuse the exact same filename for updated content, see the caching note
below — devices that already cached the old version won't notice a change
unless the filename is different.

### How photo caching works on visitors' devices

- The service worker caches each photo the first time it's requested, in a
  cache kept **separate** from the app shell itself.
- Unchanged photos are never re-downloaded, even when you push app updates —
  they're already cached under the same file path, so the service worker
  serves them straight from local storage with no network request at all.
- If you replace a photo's content later, give the new file a different
  name so its URL actually changes — that's what tells a device "this one's
  new, fetch it." Reusing the exact same filename for different image
  content won't automatically update devices that already cached the old
  one.
- The app also proactively fetches every bundled photo once, right after it
  loads (while online), rather than waiting for each item to be opened —
  so by the time a device goes offline, everything's already cached.

## Data & storage

Everything else the app remembers is stored locally in the browser's
`localStorage` on the device it's used on:

- Opening stock counts and flight details (date, flight number, sector, CSS
  staff no, CSS name)
- The current cart and sales log
- Archived (closed) flight summaries and their stock reconciliation reports

Since there's no backend, this data does not sync between devices — each
phone/tablet the app is installed on keeps its own local history. (Photos
are the exception — those are shipped with the app itself, so they're
identical for everyone.)

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
