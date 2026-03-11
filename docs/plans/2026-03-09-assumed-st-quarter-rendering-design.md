# Assumed ST Quarter Rendering Design

## Context

`MVV Netze GmbH` veroeffentlicht im finalen 2026-Preisblatt fuer `Modul 3` nur Winter-Quartale mit expliziten Zeitfenstern. `Q2` und `Q3` sind als nicht veroeffentlicht markiert. In der aktuellen UI erscheinen diese Quartale deshalb als `Keine Tariffenster`, obwohl ein belastbarer `ST`-Arbeitspreis vorhanden ist und die Produktentscheidung fachlich als konservative Annahme dargestellt werden kann.

## Decision

Komplett leere Quartale werden nur dann automatisch als `ST`-Annahme visualisiert, wenn:

- kein offizielles Zeitfenster fuer das Quartal vorhanden ist
- der Datensatz einen expliziten `ST`-Bandwert enthaelt
- die Annahme klar als nicht aus dem Originaldokument stammend markiert wird

Die Visualisierung bleibt eine Vollflaeche `00:00-24:00`, aber mit abweichender Optik und eindeutiger textlicher Kennzeichnung:

- Summary: `ST-Annahme · Quelle ohne Zeitfenster`
- Tooltip und `aria-label`: `Verifizierte ST-Annahme, da im Originaldokument fuer dieses Quartal keine Zeitfenster veroeffentlicht sind`
- Segmentfarbe: nah an `ST`, aber heller und mit Overlay/Muster
- Preisbadges links bleiben erhalten; falls ein Betreiber angenommene Quartale hat, bekommt der `ST`-Badge eine kleine Zusatzmarkierung

## Non-Goals

- keine Ableitung von `HT`- oder `NT`-Fenstern aus Winter-/Sommermustern
- keine stillen Promotions von `pending` auf `verified`
- keine Aenderung an offiziellen Zeitfenstern, wenn das Quartal bereits publizierte Fenster enthaelt

## UX Notes

- Zeitfenster werden nicht mehr sichtbar in den Segmenten gerendert
- Zeitfenster bleiben per Hover-Tooltip und Screenreader-Label verfuegbar
- die Quartalsspalten `Q1-Q4` bleiben unveraendert prominent sichtbar

## Verification

- View-Model testet explizit die `ST`-Annahme fuer `MVV Netze`
- UI testet abweichende Klasse, Summary und fehlenden Inline-Zeittext
- bestehende Quartalsmatrix-Tests fuer echte offizielle Fenster bleiben gruen
