![Spieler-Bestenliste](banner.svg)

# Spieler-Bestenliste

Wer am meisten spielt, abbaut, besiegt oder stirbt – über alle Minecraft-Server zusammen oder je Server, gesamt oder für Woche und Monat. Mit Stream-Ansicht und Kachel für die Übersicht.

Eine offizielle Erweiterung für [Hostwerk](https://github.com/Passimoritz/hostwerk-public).

## Funktionen

- Rangliste nach Spielzeit, Besuchen, abgebauten Blöcken, Toden, besiegten Monstern und Spielern, Strecke oder Hergestelltem
- Zeiträume: gesamt, letzte 30 Tage, letzte 7 Tage – die Erweiterung merkt sich einmal am Tag den Stand (im eigenen Speicher, höchstens 40 Tage)
- Alle Server zusammen oder ein Server; eine Person wird über ihre UUID erkannt – auch nach einem Namenswechsel
- Reiter „Stream-Ansicht“: ohne Bedienelemente, große Schrift – zum Abfilmen mit OBS (Fenster- oder Bildschirmaufnahme)
- Einstellungen (unter Einstellungen → Erweiterungen): Standard-Kennzahl und Zahl der Plätze
- Kachel für die Übersicht mit den ersten drei
- Medaillen mit Text für Bildschirmleser, Fehlerzustand mit „Erneut versuchen“
- Schonend: Statistiken je Server zwischengespeichert, kommt oder geht jemand, wird nur dieser Server neu geholt; Abfragen pausieren, solange die Seite nicht zu sehen ist
- Steht in der Seitenleiste unter „Server“ direkt bei Minecraft; andere Erweiterungen dürfen Reiter ergänzen

## Installieren

In Hostwerk: **Apps → Erweiterungen → Marktplatz** → „Spieler-Bestenliste“ → Installieren. Updates kommen von selbst.

## Rechte

- Minecraft-Server, Spieler und Statistiken lesen
- Eigene Daten speichern (Tages-Schnappschüsse für Woche und Monat)

Seiten laufen abgeschottet (eigener Ursprung, keine fremden Skripte); alles, was etwas ändert, fragt vorher nach.

## Entwicklung

```bash
node --test tests/*.test.js            # Tests der Logik
node pfad/zu/hostwerk-public/sdk/check.js . --strict   # dieselbe Prüfung wie der Katalog
```

Die Logik steckt in `page/lib.js` (ohne DOM, getestet), Abfragen und Fehlerzustand in `page/live.js`, die Seite in `page/app.js`. Ein Tag `vX.Y.Z` passend zu `manifest.json` veröffentlicht ein Release mit allem außer dem Repo-Werkzeug; der Hostwerk-Katalog übernimmt es.

English: [README.md](README.md) · Lizenz: MIT
