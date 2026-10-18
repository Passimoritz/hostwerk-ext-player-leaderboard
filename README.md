# Player leaderboard

Who plays, mines or dies the most – across all Minecraft servers or per server. With a dashboard tile.

An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension.

## Features

- Ranking by playtime, visits, blocks mined or deaths
- All servers together (same name = same player) or one server
- Who played in the last 7 days
- Dashboard tile with the top 3

## Install

In Hostwerk: **Apps → Extensions → Marketplace** → “Player leaderboard” → Install. Updates arrive automatically.

## Permissions

- Read Minecraft servers, players and stats

Pages run isolated (own origin, no external scripts); anything that changes something asks you first.

## Development

```bash
node --test tests/*.test.js            # logic tests
node path/to/hostwerk-public/sdk/check.js . --strict   # same check as the catalog
```

The logic lives in `page/lib.js` (no DOM, tested), the page in `page/app.js`. A tag `vX.Y.Z` matching `manifest.json` publishes a release; the Hostwerk catalog picks it up.

Deutsch: [README.de.md](README.de.md) · License: MIT
