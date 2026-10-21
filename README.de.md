![Spieler-Bestenliste](banner.svg)

# Spieler-Bestenliste

Wer am meisten spielt, abbaut, besiegt oder stirbt – über alle Minecraft-Server zusammen oder je Server, gesamt oder für Woche und Monat, dazu Spielzeit und Besuche auf Spiele-Servern. Mit Stream-Ansicht, eigener Adresse für OBS und Kachel für die Übersicht.

Eine offizielle Erweiterung für [Hostwerk](https://github.com/Passimoritz/hostwerk-public).

## Funktionen

- **Wo:** Minecraft-Server → Spieler (Abschnitt) und Übersichtskachel – seit 1.5.1 ohne eigenen Seitenleisten-Eintrag; die ganze Seite bleibt unter Erweiterungen → Öffnen
- **Gleich dort, wo man sie braucht:** Abschnitt im Reiter „Spieler“ jedes Minecraft-Servers (Hostwerk mit SDK 3.2) – die Liste dieses Servers mit Suche und Profil, ohne eigenen Reiter
- **Spielersuche, Profilkarte** mit allen Werten, letztem Besuch, Servern, **Abzeichen** (Stammspieler, Bergarbeiter, Jäger, Wanderer, Handwerker, Überlebenskünstler … in drei Stufen, nur aus dem, was Minecraft und Hostwerk ohnehin zählen) und einem **Verlaufsdiagramm** der gewählten Kennzahl
- **Als Webseite bereitstellen** (Reiter „Webseite“, Hostwerk mit SDK 3.2): Hostwerk legt eine eigene Seite (HTML + JSON) in einen Unterordner eines deiner Webserver und erneuert sie im gewählten Takt – Überschrift, Akzentfarbe, hell/dunkel/wie das System, Sprache, Kennzahlen, Plätze, Zeitraum, Server und **Spielernamen wie im Spiel, gekürzt oder ausgeblendet**. Nur Namen und Zahlen, keine Adressen oder IDs; Besucher brauchen keine Hostwerk-Anmeldung. Webserver zeigen diese Seiten unter „Seiten von Erweiterungen“.
- Rangliste nach Spielzeit, Besuchen, abgebauten Blöcken, Toden, besiegten Monstern und Spielern, Strecke oder Hergestelltem
- Zeiträume: gesamt, letzte 30 Tage, letzte 7 Tage – die Erweiterung merkt sich einmal am Tag den Stand (im eigenen Speicher, höchstens 40 Tage)
- Alle Server zusammen oder ein Server; eine Person wird über ihre UUID erkannt – auch nach einem Namenswechsel; Bedrock-Spieler (Geyser/Floodgate) bekommen ein Abzeichen
- Reiter „Stream-Ansicht“: ohne Bedienelemente, große Schrift – zum Abfilmen mit OBS (Fenster- oder Bildschirmaufnahme)
- Eigene Adresse für OBS ohne Anmeldung (`/v/player-leaderboard/`): durchsichtig, ohne Hostwerk drumherum, als „Browser“-Quelle – erst, wenn du „Stream-Ansicht ohne Anmeldung freigeben“ einschaltest. Zusätze: `?metric=`, `?days=7|30`, `?server=`, `?limit=`, `?theme=light`, `?size=` (Schriftgröße), `?title=0`, `?lang=de`
- Spiele-Server (Erweiterung „Spiele-Server“): Spielzeit und Besuche, jede Minute über die Steam-Abfrage gezählt
- Einstellungen (unter Einstellungen → Erweiterungen): Standard-Kennzahl und Zahl der Plätze
- Kachel für die Übersicht mit den ersten drei
- Medaillen mit Text für Bildschirmleser, Fehlerzustand mit „Erneut versuchen“
- Schonend: Statistiken je Server zwischengespeichert, kommt oder geht jemand, wird nur dieser Server neu geholt; Abfragen pausieren, solange die Seite nicht zu sehen ist
- Steht in der Seitenleiste unter „Server“ direkt bei Minecraft; andere Erweiterungen dürfen Reiter ergänzen

## Installieren

In Hostwerk: **Apps → Erweiterungen → Marktplatz** → „Spieler-Bestenliste“ → Installieren. Updates kommen von selbst.

## Rechte

- Minecraft-Server, Spieler und Statistiken lesen
- Spiele-Server und ihre Spieler lesen (`read:games`)
- Eine öffentliche Ansicht für OBS anbieten (`share:view`, aus, bis du sie freigibst)
- Ein kleiner Server-Teil (`native`) für die Spielzeit auf Spiele-Servern und die öffentliche Ansicht
- Eigene Daten speichern (Tages-Schnappschüsse für Woche und Monat, Spielzeit auf Spiele-Servern)

Braucht Hostwerk 3.0 oder neuer.

Seiten laufen abgeschottet (eigener Ursprung, keine fremden Skripte); alles, was etwas ändert, fragt vorher nach.

## Entwicklung

```bash
node --test tests/*.test.js            # Tests der Logik
node pfad/zu/hostwerk-public/sdk/check.js . --strict   # dieselbe Prüfung wie der Katalog
```

Die Logik steckt in `page/lib.js` (ohne DOM, getestet), Abfragen und Fehlerzustand in `page/live.js`, die Seite in `page/app.js`. Ein Tag `vX.Y.Z` passend zu `manifest.json` veröffentlicht ein Release mit allem außer dem Repo-Werkzeug; der Hostwerk-Katalog übernimmt es.

English: [README.md](README.md) · Lizenz: MIT
