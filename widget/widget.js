// Spieler-Bestenliste – Kachel: die drei mit der meisten Spielzeit (Standard-Kennzahl aus den Einstellungen).
const { html, t } = Hostwerk;
const MEDAL = ['🥇', '🥈', '🥉'];
async function load() {
  const servers = await Hostwerk.get('/mc/servers');
  let metric = 'playMs';
  try { const s = await Hostwerk.settings.get(); if (Leaderboard.METRICS.includes(s.metric)) metric = s.metric; } catch { /* Standard */ }
  const stats = {};
  await Promise.all((servers || []).map(async (s) => { try { stats[s.id] = await Hostwerk.get(`/mc/servers/${encodeURIComponent(s.id)}/stats`); } catch { stats[s.id] = { players: [] }; } }));
  const top = Leaderboard.rank(Leaderboard.merge(stats), metric, 3);
  const val = (v) => (metric === 'playMs' ? Hostwerk.fmt.duration(v) : Hostwerk.fmt.number(v));
  Hostwerk.render('#top', top.length
    ? html`<div class="tiny muted">${t('metric.' + metric)}</div>${top.map((p, i) => html`<div class="line"><span aria-hidden="true">${MEDAL[i]}</span><span class="sr">${t('place', { n: i + 1 })}</span><b class="grow ellipsis">${p.name}</b><span class="muted small">${val(p.value)}</span></div>`)}`
    : html`<div class="muted small">${t((servers || []).length ? 'noData' : 'noServers')}</div>`);
}
const reload = () => Live.guard(Hostwerk, '#top', load, { compact: true });
Hostwerk.ready().then(() => { reload(); Live.every(120000, reload); Hostwerk.on('settings', reload); Hostwerk.on('lang', reload); });
