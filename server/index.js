'use strict';
/*
 * Spieler-Bestenliste – Server-Teil (SDK 3.0):
 *   - zählt Spielzeit und Besuche auf Spiele-Servern (Erweiterung „Spiele-Server“, Recht read:games) – jede Minute
 *     über die Steam-Abfrage, gespeichert unter "games" (server/games.js)
 *   GET /api/x/player-leaderboard/games-board → { servers: [{ id: 'game:<id>', name, game }], stats: { 'game:<id>': { players } } }
 *     (für die Seite: Hostwerk.backend('GET', '/games-board'))
 *   GET /api/x/player-leaderboard/pub/board?metric=&days=&server=&limit=   (öffentliche Ansicht /v/player-leaderboard/, share:view)
 *     → { metric, days, since, players: [{ rank, name, value, bedrock }] } – nur mit Einstellung „freigeben“, sonst 403
 *   GET/POST /site, POST /site/:id/publish, DELETE /site/:id   – „Als Webseite bereitstellen“ (host.sites, SDK 3.2, server/site.js)
 */
const { source, cached } = require('./source');
const G = require('./games');
const B = require('../page/lib.js');
const S = require('./site');

const POLL_MS = 60000;

function activate(host) {
  const src = source(host);
  const storeGet = async (k) => { try { return await host.storage.get(k); } catch { return null; } };
  const storeSet = async (k, v) => { try { await host.storage.set(k, v); } catch (e) { host.log(`storage: ${e.message}`); } };

  // Spiele-Server: jede Minute nachsehen, wer spielt (nur wenn es welche gibt – ohne Erweiterung bleibt die Liste leer)
  let busy = false;
  const poll = async () => {
    if (busy) return; busy = true;
    try {
      const list = await src.games();
      const before = (await storeGet('games')) || G.empty();
      if (!list.length && !Object.keys(before.online || {}).length) return;
      await storeSet('games', G.track(before, list));
    } catch (e) { host.log(`games: ${e.message}`); } finally { busy = false; }
  };
  if (!process.env.HW_TEST) {
    const timer = setInterval(poll, POLL_MS);
    if (timer.unref) timer.unref();
    setTimeout(poll, 5000).unref?.();
    host.on('shutdown', () => clearInterval(timer));
  }

  host.router.get('/games-board', async (req, res) => {
    const st = (await storeGet('games')) || G.empty();
    res.json({ servers: G.servers(st), stats: G.asStats(st) });
  });

  // Öffentlich: Minecraft-Statistik je Server höchstens alle 30 s, Spiele-Server aus dem eigenen Speicher
  const allStats = cached(async () => {
    const list = await src.api('/mc/servers').catch(() => []);
    const stats = {};
    await Promise.all((Array.isArray(list) ? list : []).map(async (s) => { stats[s.id] = await src.mcStats(s.id); }));
    Object.assign(stats, G.asStats((await storeGet('games')) || G.empty()));
    return stats;
  }, 30000);
  host.publicRouter.get('/pub/board', async (req, res) => {
    const st = await src.settings();
    if (!st.publicView) return res.status(403).json({ error: 'off' });
    const q = req.query || {};
    const snaps = (await storeGet('snapshots')) || [];
    res.setHeader('Cache-Control', 'no-store');
    res.json(B.board(await allStats(), { snaps, metric: String(q.metric || st.metric || 'playMs'), days: Number(q.days) || 0, server: q.server ? String(q.server) : '', limit: Number(q.limit) || 10 }));
  });

  // „Als Webseite bereitstellen“ (Hostwerk mit SDK 3.2): Seite + data.json in einen Webserver – ohne host.sites einfach nicht
  const sites = host.sites && typeof host.sites.register === 'function' ? host.sites : null;
  if (sites) {
    sites.register({
      id: 'board', title: { de: 'Bestenliste', en: 'Leaderboard' }, defaults: S.DEFAULTS,
      render: async (raw, { lang } = {}) => {
        const opt = S.options(raw, lang);
        const d = S.data(await allStats(), (await storeGet('snapshots')) || [], opt);
        return { 'index.html': S.page(opt), 'data.json': JSON.stringify(d) };
      },
    });
  }
  // Für die eigene Seite (Reiter „Webseite“): Ziele, eigene Seiten, anlegen/ändern/entfernen/erneuern – Hostwerk prüft alles
  const need = (res) => { if (sites) return true; res.status(501).json({ error: host.t('Needs a newer Hostwerk (pages in a web server, SDK 3.2).') }); return false; };
  const fail = (res, e) => res.status(e.status || 400).json({ error: e.message });
  host.router.get('/site', (req, res) => res.json(sites ? { available: true, targets: sites.targets(), list: sites.list(), defaults: S.DEFAULTS } : { available: false, targets: [], list: [], defaults: S.DEFAULTS }));
  host.router.post('/site', async (req, res) => { if (!need(res)) return; try { const b = req.body || {}; res.json(await sites.save({ id: b.id || undefined, kind: 'board', web: b.web, vhost: b.vhost || null, sub: b.sub, title: b.title, interval: b.interval, on: b.on, options: S.options(b.options, host.lang()) })); } catch (e) { fail(res, e); } });
  host.router.post('/site/:id/publish', async (req, res) => { if (!need(res)) return; try { res.json(await sites.publish(req.params.id)); } catch (e) { fail(res, e); } });
  host.router.delete('/site/:id', (req, res) => { if (!need(res)) return; try { res.json({ ok: sites.remove(req.params.id) }); } catch (e) { fail(res, e); } });

  return { poll };
}

module.exports = { activate };
