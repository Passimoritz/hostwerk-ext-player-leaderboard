![Spieler-Bestenliste](banner.svg)

# Spieler-Bestenliste

Wer am meisten spielt, abbaut oder stirbt – über alle Minecraft-Server zusammen oder je Server. Mit Kachel für die Übersicht.

Eine offizielle Erweiterung für [Hostwerk](https://github.com/Passimoritz/hostwerk-public).

## Funktionen

- Rangliste nach Spielzeit, Besuchen, abgebauten Blöcken oder Toden
- Alle Server zusammen (gleicher Name = gleiche Person) oder ein Server
- Wer in den letzten 7 Tagen da war
- Kachel für die Übersicht mit den ersten drei

## Installieren

In Hostwerk: **Apps → Erweiterungen → Marktplatz** → „Spieler-Bestenliste“ → Installieren. Updates kommen von selbst.

## Rechte

- Minecraft-Server, Spieler und Statistiken lesen

Seiten laufen abgeschottet (eigener Ursprung, keine fremden Skripte); alles, was etwas ändert, fragt vorher nach.

## Entwicklung

```bash
node --test tests/*.test.js            # Tests der Logik
node pfad/zu/hostwerk-public/sdk/check.js . --strict   # dieselbe Prüfung wie der Katalog
```

Die Logik steckt in `page/lib.js` (ohne DOM, getestet), die Seite in `page/app.js`. Ein Tag `vX.Y.Z` passend zu `manifest.json` veröffentlicht ein Release; der Hostwerk-Katalog übernimmt es.

English: [README.md](README.md) · Lizenz: MIT
