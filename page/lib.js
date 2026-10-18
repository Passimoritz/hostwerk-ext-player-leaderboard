/* Leaderboard – pure logic without DOM, tested in tests/lib.test.js (node --test). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Leaderboard = api;
}(typeof self !== 'undefined' ? self : this, () => {
  const METRICS = {
    playMs: (p) => p.playMs || 0,
    sessions: (p) => p.sessions || 0,
    mined: (p) => (p.world && p.world.mined) || 0,
    deaths: (p) => (p.world && p.world.deaths) || 0,
  };
  /** Spieler mehrerer Server zusammenführen (gleicher Name = gleiche Person): Werte addieren, letzte Sitzung behalten. */
  function merge(statsByServer) {
    const map = new Map();
    for (const [server, st] of Object.entries(statsByServer || {})) {
      for (const p of (st && st.players) || []) {
        const k = String(p.name || p.uuid || '?').toLowerCase();
        const cur = map.get(k) || { name: p.name || '?', uuid: p.uuid || null, playMs: 0, sessions: 0, last: 0, world: { mined: 0, deaths: 0 }, servers: [] };
        cur.playMs += METRICS.playMs(p); cur.sessions += METRICS.sessions(p); cur.world.mined += METRICS.mined(p); cur.world.deaths += METRICS.deaths(p);
        cur.last = Math.max(cur.last, p.last || 0);
        if (!cur.servers.includes(server)) cur.servers.push(server);
        map.set(k, cur);
      }
    }
    return [...map.values()];
  }
  /** Bestenliste nach Kennzahl (absteigend; bei Gleichstand der Name). */
  function rank(players, metric = 'playMs', limit = 20) {
    const f = METRICS[metric] || METRICS.playMs;
    return [...(players || [])].filter((p) => f(p) > 0).sort((a, b) => f(b) - f(a) || String(a.name).localeCompare(String(b.name))).slice(0, limit).map((p, i) => ({ ...p, rank: i + 1, value: f(p) }));
  }
  /** Wer war in den letzten 7 Tagen da? */
  function activeWeek(players, now = Date.now()) { return (players || []).filter((p) => p.last && now - p.last < 7 * 86400000).length; }
  return { METRICS: Object.keys(METRICS), merge, rank, activeWeek };
}));
