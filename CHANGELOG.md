## 1.4.0

- Game servers too: for the running servers of the extension “Game servers” a small server part counts playtime and visits through the Steam query once a minute (permission `read:games`); they appear in the server picker, in “all servers”, in the periods and on the tile. Game players are kept apart per server (a “Steve” in Valheim is not the Minecraft Steve). / Auch Spiele-Server: Für die laufenden Server der Erweiterung „Spiele-Server“ zählt ein kleiner Server-Teil jede Minute Spielzeit und Besuche über die Steam-Abfrage (Recht `read:games`); sie stehen in der Server-Auswahl, bei „alle Server“, in den Zeiträumen und auf der Kachel. Spiele-Spieler bleiben je Server getrennt.
- Real OBS view: own address without sign-in (`/v/player-leaderboard/`, permission `share:view`) – transparent, without Hostwerk around it; the stream tab shows the address with metric, period and server already in it. Off until you switch on “Share the stream view without sign-in”. Options: `?metric=`, `?days=7|30`, `?server=`, `?limit=`, `?theme=light`, `?size=`, `?title=0`, `?lang=de`. / Echte OBS-Ansicht: eigene Adresse ohne Anmeldung (`/v/player-leaderboard/`, Recht `share:view`) – durchsichtig, ohne Hostwerk drumherum; der Stream-Reiter zeigt die Adresse mit Kennzahl, Zeitraum und Server. Aus, bis du „Stream-Ansicht ohne Anmeldung freigeben“ einschaltest.
- Needs Hostwerk 3.0 (SDK 3.0). / Braucht Hostwerk 3.0 (SDK 3.0).

## 1.3.0

- Periods “30 days” and “7 days”: the extension keeps one snapshot of the totals per day (own storage, up to 40 days). / Zeiträume „30 Tage“ und „7 Tage“: die Erweiterung merkt sich einen Stand je Tag (eigener Speicher, höchstens 40 Tage).
- More metrics from Minecraft’s own statistics: mobs and players killed, distance, crafted items. Bedrock players (Geyser/Floodgate) get a badge. / Weitere Kennzahlen aus Minecrafts eigener Statistik: besiegte Monster und Spieler, Strecke, Hergestelltes. Bedrock-Spieler (Geyser/Floodgate) bekommen ein Abzeichen.
- Players are merged by UUID, so a name change no longer splits them; the newest name is shown. / Spieler werden über die UUID zusammengeführt – ein Namenswechsel trennt sie nicht mehr; angezeigt wird der neueste Name.
- “Stream view” tab with large text and no controls (for OBS window capture). / Reiter „Stream-Ansicht“ mit großer Schrift ohne Bedienelemente (für die Fensteraufnahme in OBS).
- Settings: default metric and number of places (Settings → Extensions). / Einstellungen: Standard-Kennzahl und Zahl der Plätze (Einstellungen → Erweiterungen).
- The server list follows new and removed servers instead of filling up only once. / Die Server-Auswahl folgt neuen und entfernten Servern, statt sich nur einmal zu füllen.
- Far fewer requests: stats cached per server, a join or leave only refreshes that server, at most every 10 s; polling pauses while the page is hidden. / Deutlich weniger Anfragen: Statistik je Server zwischengespeichert, Kommen/Gehen holt nur diesen Server neu, höchstens alle 10 s; Abfragen pausieren bei verstecktem Reiter.
- Error state with “Try again” on page and tile; medals and places readable for screen readers. / Fehlerzustand mit „Erneut versuchen“ auf Seite und Kachel; Medaillen und Plätze für Bildschirmleser lesbar.
- Numbers and dates in Hostwerk’s language, sizes from the design scale, the page sits next to Minecraft in the sidebar, other extensions may add tabs. The release packs everything except the repository tooling. Needs Hostwerk 2.11. / Zahlen und Daten in Hostwerks Sprache, Größen aus der Design-Skala, die Seite steht in der Seitenleiste bei Minecraft, andere Erweiterungen dürfen Reiter ergänzen. Das Release packt alles außer dem Repo-Werkzeug. Braucht Hostwerk 2.11.

## 1.2.1

- The server selection has a name for screen readers. / Die Server-Auswahl hat einen Namen für Bildschirmleser.

## 1.2.0

- New animated icon and a banner for Hostwerk's new extension page, category “games”. / Neues bewegtes Symbol und ein Banner für die neue Erweiterungsseite, Kategorie „games“.

## 1.1.0

- Looks exactly like Hostwerk's own pages: uses Hostwerk's design classes (card, btn, badge …) from the SDK 2.2 design kit; Hostwerk draws the page header. / Sieht aus wie Hostwerks eigene Seiten: Hostwerks Design-Klassen aus dem Baukasten (SDK 2.2), Kopf zeichnet Hostwerk.

## 1.0.0

- First release / Erste Fassung.
