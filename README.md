![Player leaderboard](banner.svg)

# Player leaderboard

Who plays, mines, kills or dies the most – across all Minecraft servers or per server, all time or for the week and month. With a stream view and a dashboard tile.

An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension.

## Features

- Ranking by playtime, visits, mined blocks, deaths, mobs and players killed, distance or crafted items
- Periods: all time, last 30 days, last 7 days – the extension remembers the totals once a day (in its own storage, up to 40 days)
- All servers together or one server; a person is recognised by their UUID – even after a name change
- “Stream view” tab: no controls, large text – for capturing with OBS (window or display capture)
- Settings (under Settings → Extensions): default metric and number of places
- Dashboard tile with the top three
- Medals with text for screen readers, error state with “Try again”
- Light on Hostwerk: stats are cached per server, when someone joins or leaves only that server is fetched again; polling pauses while the page is not visible
- Sits in the sidebar under “Servers” right next to Minecraft; other extensions may add tabs

## Install

In Hostwerk: **Apps → Extensions → Marketplace** → “Player leaderboard” → Install. Updates arrive automatically.

## Permissions

- Read Minecraft servers, players and stats
- Store own data (daily snapshots for the week and month)

Pages run isolated (own origin, no external scripts); anything that changes something asks you first.

## Development

```bash
node --test tests/*.test.js            # logic tests
node path/to/hostwerk-public/sdk/check.js . --strict   # same check as the catalog
```

The logic lives in `page/lib.js` (no DOM, tested), polling and the error state in `page/live.js`, the page in `page/app.js`. A tag `vX.Y.Z` matching `manifest.json` publishes a release with everything except the repository tooling; the Hostwerk catalog picks it up.

Deutsch: [README.de.md](README.de.md) · License: MIT
