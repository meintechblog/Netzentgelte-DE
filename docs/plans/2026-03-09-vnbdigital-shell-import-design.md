# VNBdigital Shell Import Design

**Date:** 2026-03-09

## Goal

Die interne Shell-Registry soll von einem kuratierten Slice auf eine belastbare Vollbasis aller in VNBdigital gelisteten deutschen Stromverteilnetzbetreiber wachsen, ohne bestehende veröffentlichte Betreiberidentitäten oder öffentliche Qualitätsregeln zu beschädigen.

## Source Choice

Empfohlen ist VNBdigital als Primärquelle für die Shell-Hülle.

Begründung:
- VNBdigital ist öffentlich erreichbar und listet aktuell `813` Verteilnetzbetreiber.
- Die Quelle liefert stabile Grundfelder wie `name`, `website`, `address`, `postcode`, `city`, `types`, `bbox` und `layerUrl`.
- Die Daten eignen sich für die Hülle, nicht automatisch für veröffentlichte Tarifdaten.

Nicht gewählt:
- MaStR als Primärquelle. MaStR bleibt wichtig für spätere Cross-Checks, ist für diesen Schritt aber operativ schwerer und deutlich datenintensiver.
- Freies Scraping einzelner Websites. Das skaliert nicht für den Shell-Vollausbau.

## Product Rules

- Öffentliche Webapp und öffentliche APIs zeigen weiterhin nur `verified` und `publishable`.
- Die Vollmenge aus VNBdigital bleibt zunächst intern über die Shell-Registry sichtbar.
- Bestehende Slugs veröffentlichter oder bereits angelegter Betreiber dürfen durch den Bulk-Import nicht umbenannt werden.
- Neue Betreiber erhalten nur dann einen neuen Slug, wenn keine belastbare Übereinstimmung zu einem bestehenden Shell- oder Publikationsdatensatz vorliegt.

## Matching Strategy

Der Import wird als Merge und nicht als rohe Ersetzung gebaut.

Reihenfolge:
1. Bestehende veröffentlichte Betreiber als höchste Priorität matchen.
2. Danach bestehende Shell-Einträge matchen.
3. Nur verbleibende VNBdigital-Datensätze erzeugen neue Shells.

Match-Signale:
- normalisierter Betreibername
- normalisierte Website-Hostnames
- bekannte Alias-Sonderfälle

Wenn mehrere Kandidaten kollidieren, wird kein automatischer Merge erzwungen. Der Datensatz bleibt als neuer Shell-Kandidat mit Notiz stehen, statt eine falsche Identität zu überschreiben.

## Data Model Impact

Die bestehende `operator_shells`-Struktur bleibt der Zielzustand. Neu hinzu kommen in der Seed-/Build-Pipeline:
- VNBdigital-ID
- optionale Detailfelder wie Adresse, Postleitzahl, Stadt, `layerUrl`, `bbox`
- Import-Metadaten, dass der Shell-Eintrag aus VNBdigital stammt

Diese Felder dienen dem späteren Auffüllen von Quellen, Geo-Zuordnung und Review.

## Pipeline Shape

1. Öffentliche VNB-Liste aus `vnb_vnbs` abrufen.
2. Für jede VNBdigital-ID einen Detailabruf fahren.
3. Rohdaten in ein internes `VnbdigitalShellCandidate`-Format mappen.
4. Kandidaten gegen bestehende veröffentlichte Betreiber und Shells mergen.
5. Ergebnis in `operator-shells.seed.json` schreiben.
6. Der bestehende Shell-Import persistiert dieses Ergebnis in die Datenbank.

## Validation Rules

- Keine doppelten Slugs.
- Keine leeren Betreiber-Namen.
- Keine Shells ohne belastbare Website oder VNBdigital-Herkunft.
- Bereits veröffentlichte Betreiber müssen nach dem Merge weiterhin genau einmal in der Shell-Registry vorkommen.
- Die Vollbasis muss deutlich über dem bisherigen Slice liegen und sich an der VNBdigital-Gesamtzahl orientieren.

## Rollout

Der Schritt ist abgeschlossen, wenn:
- die Seed-/DB-Shell-Zahl von `37` auf eine belastbare VNBdigital-Vollmenge wächst
- veröffentlichte Betreiber weiterhin stabil und unverändert bleiben
- die interne Shell-API die neue Grundmenge ausliefert
- alle Tests und der LXC-Import grün laufen
