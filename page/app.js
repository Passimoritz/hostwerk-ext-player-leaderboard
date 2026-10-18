// Spieler-Bestenliste – Seite: Spielzeit, Sitzungen, Abgebautes und Tode über alle (oder einen) Minecraft-Server.
const { html, t } = Hostwerk;
const B = Leaderboard;
let metric = 'playMs'; let server = '';
const MEDAL = ['🥇', '🥈', '🥉'];
const fmtValue = (m, v) => (m === 'playMs' ? Hostwerk.fmt.duration(v) : Hostwerk.fmt.number(v));
async function load() {
  const servers = await Hostwerk.get('/mc/servers');
  if (!servers.length) { Hostwerk.render('#list', html`<div class="empty"><b>${t('noServers')}</b>${t('noServersHint')}</div>`); return; }
  const sel = document.getElementById('server');
  if (!sel.options.length) { sel.append(new Option(t('allServers'), '')); for (const s of servers) sel.append(new Option(s.name, s.id)); }
  const ids = server ? [server] : servers.map((s) => s.id);
  const stats = {};
  await Promise.all(ids.map(async (id) => { try { stats[id] = await Hostwerk.get(`/mc/servers/${encodeURIComponent(id)}/stats`); } catch { stats[id] = { players: [] }; } }));
  const all = B.merge(stats);
  document.getElementById('sub').textContent = t('summary', { n: all.length, week: B.activeWeek(all) });
  const list = B.rank(all, metric);
  Hostwerk.render('#list', list.length ? html`<div class="stack">${list.map((p) => html`<div class="entry ${p.rank <= 3 ? 'top' : ''}"><span class="place">${p.rank <= 3 ? MEDAL[p.rank - 1] : p.rank}</span><b class="grow ellipsis">${p.name}</b>${p.servers.length > 1 ? html`<span class="badge">${t('servers', { n: p.servers.length })}</span>` : ''}<span class="value">${fmtValue(metric, p.value)}</span></div>`)}</div>` : html`<div class="empty">${t('noData')}</div>`);
}
document.getElementById('server').addEventListener('change', (e) => { server = e.target.value; load(); });
document.getElementById('metrics').addEventListener('click', (e) => { const b = e.target.closest('button[data-m]'); if (!b) return; metric = b.dataset.m; for (const x of document.querySelectorAll('#metrics button')) x.classList.toggle('primary', x === b); load(); });
Hostwerk.ready().then(() => { load(); setInterval(load, 60000); Hostwerk.on('minecraft', load); Hostwerk.on('lang', load); });
