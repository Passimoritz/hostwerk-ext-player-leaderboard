// Spieler-Bestenliste – Kachel: die drei mit der meisten Spielzeit.
const { html, t } = Hostwerk;
async function load() {
  const servers = await Hostwerk.get('/mc/servers');
  const stats = {};
  await Promise.all(servers.map(async (s) => { try { stats[s.id] = await Hostwerk.get(`/mc/servers/${encodeURIComponent(s.id)}/stats`); } catch { stats[s.id] = { players: [] }; } }));
  const top = Leaderboard.rank(Leaderboard.merge(stats), 'playMs', 3);
  Hostwerk.render('#top', top.length ? html`${top.map((p, i) => html`<div class="row"><span>${['🥇', '🥈', '🥉'][i]}</span><b class="hw-grow hw-ellipsis">${p.name}</b><span class="hw-muted hw-small">${Hostwerk.fmt.duration(p.value)}</span></div>`)}` : html`<div class="hw-muted hw-small">${t('noData')}</div>`);
}
Hostwerk.ready().then(() => { load(); setInterval(load, 120000); });
