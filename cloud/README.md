# Dinkabalen Cloud Publication Reader — DEVELOPMENT ONLY

This branch adds a transport module, **not a live integration**.

Current site: `qourts/dinkabalen` on `main` continues to serve the original static HTML schedule/results. The `cloud/read-publication.mjs` module has not been imported by `index.html`, and it makes **no network request** until called.

## Future usage

```js
import {readLatestPublication} from './cloud/read-publication.mjs';
const state = await readLatestPublication({
  projectUrl: 'https://uiymcsbioevuyyoeirba.supabase.co',
  publishableKey: '<project publishable key, safe for browsers>',
  eventId: 'dinkabalen-2026',
  expectedEventDate: '2026-12-05',
  scheduleFingerprint: '<SHA-256 of canonical schedule manifest>',
});
```

The credential in the example is a placeholder. **Never embed any service_role / sb_secret key** in this repository.

- `ready`: verified published snapshot; the UI may render its scores/roster/standings.
- `unpublished`: server has no approved snapshot; show original schedule and explicitly state no publication has occurred.
- `unavailable`: offline/network/auth failure; do not imply the cloud is up to date. Render a visible stale/offline label.
- `invalid`: digest, event or fixture mismatch; show an error and do not use the suspect data.

## Activation gates

1. The tournament is rescheduled to **Saturday, December 5, 2026**. The current provisional operating assumptions are 6:00 PM, Pickle Cave, five courts and the existing 67 fixtures; reconfirm any other organizer changes before deployment.
2. Complete an authenticated publisher pilot in Supabase, with an approved publisher and independent proof that unauthorized users cannot publish.
3. Publish **synthetic** test snapshots only after an isolation plan; do not mix them with event production snapshots.
4. Integrate the reader into the portal's existing data model in a separate PR; avoid duplicating standings/qualification algorithms. Test the full 67-fixture and 30-slot parity.
5. Test browser refresh, offline fallback, stale revisions, invalid data, and mobile screens.
6. Obtain explicit organizer authorization before merging to `main` and deploying GitHub Pages.

Until then, **no public site has been changed and no cloud data is being displayed**.
