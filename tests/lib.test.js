const test = require('node:test');
const assert = require('node:assert');
const B = require('../page/lib.js');
const NOW = Date.UTC(2026, 9, 18);
const stats = {
  freunde: { players: [{ name: 'Alex', playMs: 3600000, sessions: 3, last: NOW - 86400000, world: { mined: 100, deaths: 2 } }, { name: 'Sam', playMs: 7200000, sessions: 1, last: NOW - 30 * 86400000 }] },
  kreativ: { players: [{ name: 'alex', playMs: 5400000, sessions: 2, last: NOW - 3600000, world: { mined: 5, deaths: 0 } }, { name: 'Kim', playMs: 0, sessions: 0 }] },
};

test('gleicher Name auf mehreren Servern = eine Person, Werte addiert', () => {
  const all = B.merge(stats);
  const alex = all.find((p) => p.name.toLowerCase() === 'alex');
  assert.strictEqual(all.length, 3);
  assert.strictEqual(alex.playMs, 9000000); assert.strictEqual(alex.sessions, 5); assert.strictEqual(alex.world.mined, 105);
  assert.deepStrictEqual(alex.servers, ['freunde', 'kreativ']);
  assert.strictEqual(alex.last, NOW - 3600000);
});
test('Rangliste je Kennzahl, Nullen fallen raus', () => {
  const all = B.merge(stats);
  assert.deepStrictEqual(B.rank(all, 'playMs').map((p) => [p.rank, p.name]), [[1, 'Alex'], [2, 'Sam']]);
  assert.deepStrictEqual(B.rank(all, 'deaths').map((p) => p.name), ['Alex']);
  assert.strictEqual(B.rank(all, 'unbekannt')[0].name, 'Alex', 'unbekannte Kennzahl = Spielzeit');
});
test('aktiv in den letzten 7 Tagen', () => { assert.strictEqual(B.activeWeek(B.merge(stats), NOW), 1); });
test('leere Daten', () => { assert.deepStrictEqual(B.merge({}), []); assert.deepStrictEqual(B.rank([], 'playMs'), []); });
