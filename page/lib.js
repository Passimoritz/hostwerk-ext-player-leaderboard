/* Leaderboard – pure logic without DOM, tested in tests/lib.test.js (node --test). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Leaderboard = api;
}(typeof self !== 'undefined' ? self : this, () => {
  const DAY = 86400000;
  const w = (p, k) => (p.world && Number(p.world[k])) || 0;
  /** Kennzahlen: Hostwerks Sitzungen (Spielzeit, Besuche) und die Welt-Statistik, die Minecraft selbst schreibt. */
  const METRICS = {
    playMs: (p) => p.playMs || 0,
    sessions: (p) => p.sessions || 0,
    mined: (p) => w(p, 'mined'),
    deaths: (p) => w(p, 'deaths'),
    mobKills: (p) => w(p, 'mobKills'),
    playerKills: (p) => w(p, 'playerKills'),
    distanceKm: (p) => w(p, 'distanceKm'),
    crafted: (p) => w(p, 'crafted'),
  };
  const KEYS = Object.keys(METRICS);
  const blank = () => Object.fromEntries(KEYS.filter((k) => !['playMs', 'sessions'].includes(k)).map((k) => [k, 0]));
  /** UUID eines Eintrags (Hostwerk legt sie unter world.uuid ab, ältere Fassungen direkt). */
  const uuidOf = (p) => String(p.uuid || (p.world && p.world.uuid) || '').toLowerCase().replace(/-/g, '') || null;

  /**
   * Spieler mehrerer Server zusammenführen: gleiche UUID = gleiche Person, auch nach einem Namenswechsel. Einträge ohne
   * UUID (nur Hostwerks Sitzungen) hängen sich an die Person mit demselben Namen. Werte addieren, letzte Sitzung und
   * den neuesten Namen behalten.
   */
  function merge(statsByServer) {
    const byKey = new Map();
    const nameToKey = new Map();
    const rows = [];
    for (const [server, st] of Object.entries(statsByServer || {})) for (const p of (st && st.players) || []) if (p) rows.push({ server, p });
    // Erst die mit UUID (eindeutig), dann die ohne – so finden Namens-Einträge ihre Person
    rows.sort((a, b) => (uuidOf(b.p) ? 1 : 0) - (uuidOf(a.p) ? 1 : 0));
    for (const { server, p } of rows) {
      const name = String(p.name || '?');
      const uuid = uuidOf(p);
      const key = uuid ? `u:${uuid}` : (nameToKey.get(name.toLowerCase()) || `n:${name.toLowerCase()}`);
      const cur = byKey.get(key) || { key, name, uuid, playMs: 0, sessions: 0, last: 0, world: blank(), servers: [] };
      cur.playMs += METRICS.playMs(p); cur.sessions += METRICS.sessions(p);
      for (const k of Object.keys(cur.world)) cur.world[k] += w(p, k);
      // Neuester Name gewinnt (wer zuletzt da war)
      if ((p.last || 0) >= cur.last && p.name) cur.name = name;
      cur.last = Math.max(cur.last, p.last || 0);
      if (!cur.servers.includes(server)) cur.servers.push(server);
      byKey.set(key, cur);
      if (!nameToKey.has(name.toLowerCase())) nameToKey.set(name.toLowerCase(), key);
    }
    for (const p of byKey.values()) p.world.distanceKm = Math.round(p.world.distanceKm * 10) / 10;
    return [...byKey.values()];
  }
  /** Bestenliste nach Kennzahl (absteigend; bei Gleichstand der Name). */
  function rank(players, metric = 'playMs', limit = 20) {
    const f = METRICS[metric] || METRICS.playMs;
    return [...(players || [])].filter((p) => f(p) > 0).sort((a, b) => f(b) - f(a) || String(a.name).localeCompare(String(b.name))).slice(0, limit).map((p, i) => ({ ...p, rank: i + 1, value: f(p) }));
  }
  /** Wer war in den letzten 7 Tagen da? */
  function activeWeek(players, now = Date.now()) { return (players || []).filter((p) => p.last && now - p.last < 7 * DAY).length; }

  /* ---------- Zeiträume: Schnappschüsse der Gesamtwerte, einmal am Tag gespeichert ---------- */
  const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
  /** Gesamtwerte aller Spieler in kurzer Form: { key: [werte in KEYS-Reihenfolge] } – höchstens max Spieler (die aktivsten). */
  function snapshot(players, max = 150) {
    const top = [...(players || [])].sort((a, b) => (b.last || 0) - (a.last || 0)).slice(0, max);
    return Object.fromEntries(top.map((p) => [p.key || p.name, KEYS.map((k) => METRICS[k](p))]));
  }
  /**
   * Heutigen Schnappschuss in die Liste legen (einer je Tag, der neueste gewinnt), ältere als keepDays fallen raus.
   * snaps = [{ day, v }] → neue Liste
   */
  function addSnapshot(snaps, players, now = Date.now(), keepDays = 40) {
    const day = dayKey(now);
    const limit = dayKey(now - keepDays * DAY);
    const rest = (Array.isArray(snaps) ? snaps : []).filter((s) => s && s.day && s.day !== day && s.day >= limit);
    return [...rest, { day, v: snapshot(players) }].sort((a, b) => a.day.localeCompare(b.day));
  }
  /**
   * Werte für einen Zeitraum (days = 7 oder 30): aktueller Stand minus Schnappschuss von vor days Tagen. Gibt es keinen
   * so alten, gilt der älteste – since sagt, ab wann wirklich gezählt wird. → { players, since }
   */
  function period(players, snaps, days, now = Date.now()) {
    if (!days) return { players: players || [], since: null };
    const want = dayKey(now - days * DAY);
    const list = (Array.isArray(snaps) ? snaps : []).filter((s) => s && s.day < dayKey(now));
    const base = [...list].reverse().find((s) => s.day <= want) || list[0];
    if (!base) return { players: [], since: dayKey(now) };
    const out = (players || []).map((p) => {
      const old = base.v[p.key || p.name];
      if (!old) return p; // neu seit dem Schnappschuss – alles zählt
      const d = (i) => Math.max(0, METRICS[KEYS[i]](p) - (Number(old[i]) || 0));
      const world = { ...p.world };
      KEYS.forEach((k, i) => { if (!['playMs', 'sessions'].includes(k)) world[k] = d(i); });
      return { ...p, playMs: d(KEYS.indexOf('playMs')), sessions: d(KEYS.indexOf('sessions')), world };
    });
    return { players: out, since: base.day };
  }
  /** Größe in Bytes, wie Hostwerk.storage sie zählt (JSON) – zum Kürzen unter 256 KB. */
  const sizeOf = (x) => JSON.stringify(x).length;
  /** Älteste Schnappschüsse weglassen, bis die Liste unter max Bytes bleibt. */
  function fit(snaps, max = 200 * 1024) { let s = [...(snaps || [])]; while (s.length > 1 && sizeOf(s) > max) s = s.slice(1); return s; }

  return { METRICS: KEYS, merge, rank, activeWeek, snapshot, addSnapshot, period, fit, dayKey, uuidOf };
}));
