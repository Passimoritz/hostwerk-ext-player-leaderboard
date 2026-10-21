![Player leaderboard](banner.svg)

# Player leaderboard

Who plays, mines, kills or dies the most – across all Minecraft servers or per server, all time or for the week and month, plus playtime and visits on game servers. With a stream view, its own address for OBS and a dashboard tile.

An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension.

## Features

- **Right where you need it:** a section in the “Players” tab of every Minecraft server (Hostwerk with SDK 3.2) – the board of that server with search and profile, without its own tab
- **Player search, profile card** with every value, last visit, servers, **badges** (regular, miner, hunter, wanderer, crafter, survivor … in three levels, only from what Minecraft and Hostwerk count anyway) and a **history chart** of the chosen value
- **Provide as a web page** (tab “Web page”, Hostwerk with SDK 3.2): Hostwerk writes an own page (HTML + JSON) into a subfolder of one of your web servers and renews it at the chosen interval – heading, accent colour, light/dark/system, language, values, places, period, server and **player names as in the game, shortened or hidden**. Only names and numbers, no addresses or IDs; no Hostwerk sign-in needed for visitors. Web servers show these pages under “Pages from extensions”.
- Ranking by playtime, visits, mined blocks, deaths, mobs and players killed, distance or crafted items
- Periods: all time, last 30 days, last 7 days – the extension remembers the totals once a day (in its own storage, up to 40 days)
- All servers together or one server; a person is recognised by their UUID – even after a name change; Bedrock players (Geyser/Floodgate) get a badge
- “Stream view” tab: no controls, large text – for capturing with OBS (window or display capture)
- Own address for OBS without sign-in (`/v/player-leaderboard/`): transparent, without Hostwerk around it, for a “Browser” source – only after you switch on “Share the stream view without sign-in”. Options: `?metric=`, `?days=7|30`, `?server=`, `?limit=`, `?theme=light`, `?size=` (font size), `?title=0`, `?lang=de`
- Game servers (extension “Game servers”): playtime and visits counted through the Steam query once a minute
- Settings (under Settings → Extensions): default metric and number of places
- Dashboard tile with the top three
- Medals with text for screen readers, error state with “Try again”
- Light on Hostwerk: stats are cached per server, when someone joins or leaves only that server is fetched again; polling pauses while the page is not visible
- Sits in the sidebar under “Servers” right next to Minecraft; other extensions may add tabs

## Install

In Hostwerk: **Apps → Extensions → Marketplace** → “Player leaderboard” → Install. Updates arrive automatically.

## Permissions

- Read Minecraft servers, players and stats
- Read game servers and their players (`read:games`)
- Offer a public view for OBS (`share:view`, off until you share it)
- A small server part (`native`) for game server playtime and the public view
- Store own data (daily snapshots for the week and month, game server playtime)

Needs Hostwerk 3.0 or newer.

Pages run isolated (own origin, no external scripts); anything that changes something asks you first.

## Development

```bash
node --test tests/*.test.js            # logic tests
node path/to/hostwerk-public/sdk/check.js . --strict   # same check as the catalog
```

The logic lives in `page/lib.js` (no DOM, tested), polling and the error state in `page/live.js`, the page in `page/app.js`. A tag `vX.Y.Z` matching `manifest.json` publishes a release with everything except the repository tooling; the Hostwerk catalog picks it up.

Deutsch: [README.de.md](README.de.md) · License: MIT
