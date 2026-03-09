# Exact Operator Coverage Design

## Ziel

Die Deutschlandkarte soll fuer einen ersten belastbaren Slice nicht mehr mit Radien arbeiten, sondern mit echten Flaechen aus amtlichen Verwaltungsgeometrien und offiziell belegten Netzgebieten.

## Entscheidung

- Flaechen werden nur publiziert, wenn die Gebietszuordnung aus offiziellen Betreiberquellen oder offiziellen Preisblaettern belastbar ableitbar ist.
- Die Geometriebasis kommt aus amtlichen BKG-Gemeindepolygonen.
- Betreiber ohne belastbare Flaechengeometrie bleiben in der Tarifmatrix sichtbar, werden aber auf der Karte nicht als Fake-Zonen dargestellt.

## Erster Exact Slice

- Stromnetz Berlin
- SWM Infrastruktur
- wesernetz Bremen
- wesernetz Bremerhaven
- Stadtwerke Schwaebisch Hall
- Stadtwerke Ingolstadt Netze

## Datenmodell

- `operator-coverage-seed.json` dokumentiert pro Betreiber:
  - `slug`
  - `coverageUnits` mit AGS und Gemeindename
  - `geometrySourceLabel`
  - `geometrySourceUrl`
  - `coverageKind=municipality-union`
  - `coveragePrecision=exact`
- `bkg-selected-municipalities.geo.json` kapselt die benoetigten BKG-Gemeindepolygone im Repo.

## Guardrails

- Keine geschaetzten Polygone.
- Keine doppelte AGS-Zuordnung ueber zwei exakte Betreiber.
- API liefert echte GeoJSON-Geometrie fuer belegte Betreiber und `null` fuer ungeladene Flaechen.
- Die UI macht explizit kenntlich, dass nur belegte Flaechen gezeigt werden.
