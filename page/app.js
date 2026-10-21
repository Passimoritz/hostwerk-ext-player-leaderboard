// Spieler-Bestenliste – Seite: Spielzeit, Besuche, Abgebautes, Tode und mehr über alle (oder einen) Minecraft-Server,
// gesamt oder für die letzte Woche/den letzten Monat (Schnappschüsse im Speicher der Erweiterung).
const { html, t } = Hostwerk;
const B = Leaderboard;
const MEDAL = ['🥇', '🥈', '🥉'];
const STATS_TTL = 30000; // Statistik je Server höchstens alle 30 s neu holen
let metric = null; let server = ''; let days = 0; let tab = 'board';
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
  if (!servers.some((s) => s.id === server)) server = '';
  Hostwerk.render(sel, html`<option value="">${t('allServers')}</option>${servers.map((s) => html`<option value="${s.id}" ${s.id === server ? Hostwerk.raw('selected') : ''}>${s.name}</option>`)}`);
  sel.setAttribute('aria-label', t('pick_server'));
}
function drawSeg(id, attr, cur) { for (const b of document.querySelectorAll(`#${id} button[${attr}]`)) { const on = b.getAttribute(attr) === String(cur); b.classList.toggle('primary', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); } }

function entry(p, big) {
  // Medaille nur als Bild, der Platz als Text für Bildschirmleser
  const place = html`<span class="place"><span aria-hidden="true">${p.rank <= 3 ? MEDAL[p.rank - 1] : p.rank}</span><span class="sr">${t('place', { n: p.rank })}</span></span>`;
  return html`<div class="entry ${p.rank <= 3 ? 'top' : ''} ${big ? 'big' : ''}">${place}<b class="grow ellipsis">${p.name}</b>${!big && p.servers.length > 1 ? html`<span class="badge">${t('servers', { n: p.servers.length })}</span>` : ''}<span class="value">${fmtValue(metric, p.value)}</span></div>`;
}

async function load(force = false) {
  const st = await settings();
  if (!metric) metric = B.METRICS.includes(st.metric) ? st.metric : 'playMs';
  const limit = Math.max(3, Math.min(100, Number(st.limit) || 20));
  const list = await Hostwerk.get('/mc/servers');
  servers = (Array.isArray(list) ? list : []).map((s) => ({ id: s.id, name: s.name }));
  drawPicker(); drawSeg('metrics', 'data-m', metric); drawSeg('periods', 'data-d', days);
  if (!servers.length) { $('sub').textContent = ''; Hostwerk.render('#list', html`<div class="empty"><h3>${t('noServers')}</h3><p class="muted small">${t('noServersHint')}</p></div>`); return; }
  // Gesamtwerte aller Server (für Schnappschüsse immer alle), angezeigt wird der gewählte
  const all = {};
  await Promise.all(servers.map(async (s) => { all[s.id] = await statsOf(s.id, force); }));
  if (!snapsLoaded) { try { snaps = (await Hostwerk.storage.get('snapshots')) || []; } catch { snaps = []; } snapsLoaded = true; }
  const merged = B.merge(all);
  const next = B.fit(B.addSnapshot(snaps, merged));
  if (JSON.stringify(next[next.length - 1]) !== JSON.stringify(snaps[snaps.length - 1])) { snaps = next; Hostwerk.storage.set('snapshots', snaps).catch(() => {}); }
  const chosen = server ? B.merge({ [server]: all[server] }) : merged;
  const per = B.period(chosen, snaps, days);
  $('sub').textContent = t('summary', { n: Hostwerk.fmt.number(merged.length), week: Hostwerk.fmt.number(B.activeWeek(merged)) });
  Hostwerk.render('#since', days && per.since ? html`<span class="tiny muted">${t('since', { date: new Date(`${per.since}T12:00:00`).toLocaleDateString(Hostwerk.lang === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'long' }) })}</span>` : '');
  const ranked = B.rank(per.players, metric, tab === 'stream' ? Math.min(limit, 10) : limit);
  const big = tab === 'stream';
  Hostwerk.render('#list', ranked.length
    ? html`<div class="stack" role="list" aria-label="${t('metric.' + metric)}">${ranked.map((p) => html`<div role="listitem">${entry(p, big)}</div>`)}</div>`
    : html`<div class="empty"><h3>${t(days ? 'noDataPeriod' : 'noData')}</h3>${days ? html`<p class="muted small">${t('noDataPeriodHint')}</p>` : ''}</div>`);
}
const reload = (force) => Live.guard(Hostwerk, '#list', () => load(force));

function showTab(id) {
  tab = id === 'stream' ? 'stream' : 'board';
  document.body.classList.toggle('stream', tab === 'stream');
  reload();
}

$('server').addEventListener('change', (e) => { server = e.target.value; reload(); });
$('metrics').addEventListener('click', (e) => { const b = e.target.closest('button[data-m]'); if (!b) return; metric = b.dataset.m; reload(); });
$('periods').addEventListener('click', (e) => { const b = e.target.closest('button[data-d]'); if (!b) return; days = Number(b.dataset.d) || 0; reload(); });

Hostwerk.ready().then((info) => {
  showTab(info.tab);
  Hostwerk.on('tab', showTab);
  // Kam oder ging jemand, nur diesen Server neu holen – und höchstens alle 10 s neu zeichnen
  const changed = Live.throttle(() => reload(), 10000);
  Hostwerk.on('minecraft', (s) => { if (s && s.id) cache.delete(s.id); changed(); });
  Hostwerk.on('settings', () => { metric = null; reload(); });
  Hostwerk.on('lang', () => reload());
  Live.every(60000, () => reload(true));
});
