TaskFlow PWA — updated package

Files added/updated:
- site.webmanifest: install metadata and standard/maskable Android icons
- service-worker.js: caches the app shell and serves the cached dashboard when offline
- icon-192.png, icon-512.png, icon-192-maskable.png, icon-512-maskable.png
- apple-touch-icon.png: iOS home-screen icon
- favicon-16.png and favicon-32.png: browser tab icons
- index.html: service-worker registration and icon references

Deploy the contents of this folder to the same directory on an HTTPS website (localhost is also supported for development). Open the site online once and wait for it to finish loading before testing airplane mode. Then use Add to Home Screen / Install App on the device.

Task data already uses localStorage in app.js, so it is stored locally in the browser/app origin. Browser data clearing or uninstalling may remove local data; use the app's JSON backup feature regularly.

Note: Google Fonts are still an optional online request in the original HTML; when offline, the system font fallback will be used. The dashboard itself does not depend on Google Fonts to load.
