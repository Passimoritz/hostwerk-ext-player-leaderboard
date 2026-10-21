// Spieler-Bestenliste – Seite: Spielzeit, Besuche, Abgebautes, Tode und mehr über alle (oder einen) Minecraft-Server,
// gesamt oder für die letzte Woche/den letzten Monat (Schnappschüsse im Speicher der Erweiterung).
// Spiele-Server (Erweiterung „Spiele-Server“): Spielzeit und Besuche zählt der Server-Teil über die Steam-Abfrage.
// 1.5: Spielersuche, Profilkarte (alle Werte, Abzeichen, Verlauf), Abschnitt im Reiter „Spieler“ eines Minecraft-Servers
// (Hostwerk mit SDK 3.2, page/section.html – der Server ist dort fest) und Reiter „Webseite“ (page/site.js).
const { html, t } = Hostwerk;
const B = Leaderboard;
const MEDAL = ['🥇', '🥈', '🥉'];
const STATS_TTL = 30000; // Statistik je Server höchstens alle 30 s neu holen
let metric = null; let server = ''; let days = 0; let tab = 'board'; let query = ''; let profile = null; // profile = key des geöffneten Spielers
const inSection = () => Hostwerk.embed === 'section';
let lastMerged = [];
let servers = [];
let snaps = [];
let snapsLoaded = false;
const cache = new Map(); // Server → { at, data }

const fmtValue = (m, v) => (m === 'playMs' ? Hostwerk.fmt.duration(v) : m === 'distanceKm' ? t('km', { n: Hostwerk.fmt.number(v) }) : Hostwerk.fmt.number(v));
const $ = (id) => document.getElementById(id);

async function settings() { try { return await Hostwerk.settings.get(); } catch { return {}; } }
async function statsOf(id, force) {
  const c = cache.get(id);
  if (c && !force && Date.now() - c.at < STATS_TTL) return c.data;
  let data;
  try { data = await Hostwerk.get(`/mc/servers/${encodeURIComponent(id)}/stats`); } catch { data = { players: [] }; }
  cache.set(id, { at: Date.now(), data });
  return data;
}

function drawPicker() {
  const sel = $('server');
  if (!sel) return;
  if (!servers.some((s) => s.id === server)) server = '';
  Hostwerk.render(sel, html`<option value="">${t('allServers')}</option>${servers.map((s) => html`<option value="${s.id}" ${s.id === server ? Hostwerk.raw('selected') : ''}>${s.name}</option>`)}`);
  sel.setAttribute('aria-label', t('pick_server'));
}
function drawSeg(id, attr, cur) { for (const b of document.querySelectorAll(`#${id} button[${attr}]`)) { const on = b.getAttribute(attr) === String(cur); b.classList.toggle('primary', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); } }

function entry(p, big) {
  // Medaille nur als Bild, der Platz als Text für Bildschirmleser
  const place = html`<span class="place"><span aria-hidden="true">${p.rank <= 3 ? MEDAL[p.rank - 1] : p.rank}</span><span class="sr">${t('place', { n: p.rank })}</span></span>`;
  const name = big ? html`<b class="grow ellipsis">${p.name}</b>` : html`<button type="button" class="grow ellipsis entry-name" data-profile="${p.key}" aria-expanded="${profile === p.key ? 'true' : 'false'}" title="${t('profileOpen')}">${p.name}</button>`;
  return html`<div class="entry ${p.rank <= 3 ? 'top' : ''} ${big ? 'big' : ''}">${place}${name}${B.isBedrock(p) ? html`<span class="badge" title="${t('bedrockTitle')}">${t('bedrock')}</span>` : ''}${!big && p.servers.length > 1 ? html`<span class="badge">${t('servers', { n: p.servers.length })}</span>` : ''}<span class="value">${fmtValue(metric, p.value)}</span></div>`;
}

/** Profilkarte: alle Werte, Abzeichen und der Verlauf der gewählten Kennzahl (aus den täglichen Schnappschüssen). */
function profileCard(p) {
  if (!p) return '';
  const hist = B.history(snaps, p.key || p.name, metric);
  const vals = B.METRICS.map((m) => html`<div class="kv"><span class="muted small">${t('metric.' + m)}</span><b>${fmtValue(m, m === 'playMs' ? p.playMs : m === 'sessions' ? p.sessions : (p.world || {})[m] || 0)}</b></div>`);
  const badges = B.badges(p);
  return html`<div class="card card-pad stack profile" role="region" aria-label="${t('profileOf', { name: p.name })}">
    <div class="row"><b class="grow">${p.name}</b>${B.isBedrock(p) ? html`<span class="badge">${t('bedrock')}</span>` : ''}<button type="button" class="btn sm ghost" data-profile-close>${t('close')}</button></div>
    <div class="tiny muted">${t('lastSeen', { when: p.last ? new Date(p.last).toLocaleString(Hostwerk.lang === 'en' ? 'en-GB' : 'de-DE') : '–' })} · ${t('servers', { n: (p.servers || []).length })}</div>
    <div class="kvs">${vals}</div>
    ${badges.length ? html`<div class="badges" role="list" aria-label="${t('badges')}">${badges.map((b) => html`<span role="listitem" class="${`badge lvl${b.level}`}" title="${t('badge.' + b.id + '.hint')}">${t('badge.' + b.id)} ${'★'.repeat(b.level)}</span>`)}</div>` : html`<div class="tiny muted">${t('noBadges')}</div>`}
    ${hist.length > 1 ? html`<div class="stack"><span class="small muted">${t('historyOf', { metric: t('metric.' + metric) })}</span>${spark(hist)}</div>` : html`<div class="tiny muted">${t('historySoon')}</div>`}
  </div>`;
}
/** Kleines Verlaufsdiagramm (SVG, ohne Bibliothek), mit Text-Alternative. */
function spark(hist) {
  const W = 320; const H = 64; const max = Math.max(1, ...hist.map((x) => x.value)); const min = Math.min(...hist.map((x) => x.value));
  const pts = hist.map((x, i) => `${Math.round((i / (hist.length - 1)) * W)},${Math.round(H - 4 - ((x.value - min) / Math.max(1, max - min)) * (H - 8))}`).join(' ');
  const first = hist[0]; const last = hist[hist.length - 1];
  const label = t('historyAlt', { from: first.day, to: last.day, a: fmtValue(metric, first.value), b: fmtValue(metric, last.value) });
  return html`<svg class="spark" viewBox="${`0 0 ${W} ${H}`}" role="img" aria-label="${label}"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline></svg>`;
}

async function load(force = false) {
  const st = await settings();
  if (inSection() && Hostwerk.context && Hostwerk.context.kind === 'minecraft') server = Hostwerk.context.id; // Abschnitt: dieser Server
  if (!metric) metric = B.METRICS.includes(st.metric) ? st.metric : 'playMs';
  const limit = inSection() ? 10 : Math.max(3, Math.min(100, Number(st.limit) || 20));
  const list = await Hostwerk.get('/mc/servers');
  const mc = (Array.isArray(list) ? list : []).map((s) => ({ id: s.id, name: s.name }));
  // Ohne Spiele-Server (oder ältere Hostwerk-Fassung) einfach keine
  const gb = await Hostwerk.backend('GET', '/games-board').catch(() => null);
  const games = (gb && Array.isArray(gb.servers) ? gb.servers : []).map((s) => ({ id: s.id, name: s.game && s.game !== s.name ? `${s.name} · ${s.game}` : s.name }));
  servers = [...mc, ...games];
  drawPicker(); drawSeg('metrics', 'data-m', metric); drawSeg('periods', 'data-d', days);
  if (!servers.length) { $('sub').textContent = ''; Hostwerk.render('#list', html`<div class="empty"><h3>${t('noServers')}</h3><p class="muted small">${t('noServersHint')}</p></div>`); return; }
  // Gesamtwerte aller Server (für Schnappschüsse immer alle), angezeigt wird der gewählte
  const all = {};
  await Promise.all(mc.map(async (s) => { all[s.id] = await statsOf(s.id, force); }));
  if (gb && gb.stats) Object.assign(all, gb.stats);
  if (!snapsLoaded) { try { snaps = (await Hostwerk.storage.get('snapshots')) || []; } catch { snaps = []; } snapsLoaded = true; }
  const merged = B.merge(all);
  const next = B.fit(B.addSnapshot(snaps, merged));
  if (JSON.stringify(next[next.length - 1]) !== JSON.stringify(snaps[snaps.length - 1])) { snaps = next; Hostwerk.storage.set('snapshots', snaps).catch(() => {}); }
  lastMerged = merged;
  const chosen = server ? B.merge({ [server]: all[server] }) : merged;
  const per = B.period(chosen, snaps, days);
  if ($('sub')) $('sub').textContent = t('summary', { n: Hostwerk.fmt.number(merged.length), week: Hostwerk.fmt.number(B.activeWeek(merged)) });
  Hostwerk.render('#since', days && per.since ? html`<span class="tiny muted">${t('since', { date: new Date(`${per.since}T12:00:00`).toLocaleDateString(Hostwerk.lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'long' }) })}</span>` : '');
  // Suche: Platz bleibt der aus der ganzen Liste (nicht neu durchgezählt)
  const ranked = B.search(B.rank(per.players, metric, query ? 1000 : tab === 'stream' ? Math.min(limit, 10) : limit), query).slice(0, limit);
  const big = tab === 'stream';
  Hostwerk.render('#list', ranked.length
    ? html`<div class="stack" role="list" aria-label="${t('metric.' + metric)}">${ranked.map((p) => html`<div role="listitem">${entry(p, big)}</div>`)}</div>`
    : html`<div class="empty"><h3>${t(query ? 'noMatch' : days ? 'noDataPeriod' : 'noData')}</h3>${days && !query ? html`<p class="muted small">${t('noDataPeriodHint')}</p>` : ''}</div>`);
  drawProfile();
}
function drawProfile() {
  const box = $('profile'); if (!box) return;
  const p = profile && lastMerged.find((x) => x.key === profile);
  Hostwerk.render(box, p ? profileCard(p) : '');
}
const reload = (force) => Live.guard(Hostwerk, '#list', () => load(force));

function showTab(id) {
  tab = id === 'stream' ? 'stream' : id === 'site' ? 'site' : 'board';
  document.body.classList.toggle('stream', tab === 'stream');
  // Reiter „Webseite“: eigene Ansicht (page/site.js), die Bestenliste ruht so lange
  for (const el of document.querySelectorAll('[data-view]')) el.hidden = (el.dataset.view === 'site') !== (tab === 'site');
  if (tab === 'site') { if (window.LeaderboardSite) window.LeaderboardSite.show(); return; }
  drawObs();
  reload();
}

/** Eigene Adresse für OBS (öffentliche Ansicht) – nur im Reiter „Stream-Ansicht“. */
const publicUrl = () => { let origin = ''; try { origin = new URL(document.referrer).origin; } catch { /* steht auch in der Detailansicht der Erweiterung */ } return `${origin}/v/player-leaderboard/?metric=${metric || 'playMs'}${days ? `&days=${days}` : ''}${server ? `&server=${encodeURIComponent(server)}` : ''}`; };
async function drawObs() {
  if (!$('obs')) return undefined;
  if (tab !== 'stream') return Hostwerk.render('#obs', '');
  const st = await settings();
  Hostwerk.render('#obs', html`<div class="card card-pad stack obs-card"><b>${t('obsTitle')}</b>${st.publicView
    ? html`<div class="row-tight"><code class="grow ellipsis">${publicUrl()}</code><button type="button" class="btn sm" data-copy-url>${t('copyLink')}</button></div><p class="muted small">${t('obsHint')}</p>`
    : html`<p class="muted small">${t('obsOff')}</p><div><button type="button" class="btn sm" data-open-settings>${t('settings')}</button></div>`}</div>`);
  return undefined;
}
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-copy-url]')) Hostwerk.copy(publicUrl()).catch(() => {});
  if (e.target.closest('[data-open-settings]')) Hostwerk.settings.open().catch(() => {});
  const pb = e.target.closest('[data-profile]');
  if (pb) { profile = profile === pb.dataset.profile ? null : pb.dataset.profile; drawProfile(); reload(); }
  if (e.target.closest('[data-profile-close]')) { profile = null; drawProfile(); reload(); }
  if (e.target.closest('[data-open-page]')) Hostwerk.navigate(`/ext/player-leaderboard`).catch(() => {});
});

if ($('server')) $('server').addEventListener('change', (e) => { server = e.target.value; drawObs(); reload(); });
if ($('search')) $('search').addEventListener('input', Live.throttle((e) => { query = e.target.value; reload(); }, 300));
$('metrics').addEventListener('click', (e) => { const b = e.target.closest('button[data-m]'); if (!b) return; metric = b.dataset.m; drawObs(); reload(); });
$('periods').addEventListener('click', (e) => { const b = e.target.closest('button[data-d]'); if (!b) return; days = Number(b.dataset.d) || 0; drawObs(); reload(); });

Hostwerk.ready().then((info) => {
  if ($('search')) $('search').setAttribute('aria-label', t('searchPlayer'));
  showTab(info.tab);
  Hostwerk.on('tab', showTab);
  // Webserver → „Seiten von Erweiterungen“ → Einstellungen: ?action=site&target=<seite>
  const act = (a) => { if (!a || a.id !== 'site') return; Hostwerk.setTab('site').catch(() => {}); showTab('site'); if (window.LeaderboardSite) window.LeaderboardSite.open(a.target || ''); };
  Hostwerk.on('action', act);
  act(info.action);
  // Kam oder ging jemand, nur diesen Server neu holen – und höchstens alle 10 s neu zeichnen
  const changed = Live.throttle(() => reload(), 10000);
  Hostwerk.on('minecraft', (s) => { if (s && s.id) cache.delete(s.id); changed(); });
  Hostwerk.on('settings', () => { metric = null; drawObs(); reload(); });
  Hostwerk.on('lang', () => reload());
  Live.every(60000, () => reload(true));
});
