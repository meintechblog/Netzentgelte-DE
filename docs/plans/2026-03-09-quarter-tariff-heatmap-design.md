# Quarter Tariff Heatmap Design

## Context

Die bisherige Quartalsdarstellung zeigt Tarifzeiten als kompakte Listen pro Quartal. Das ist korrekt, skaliert aber visuell schlecht, sobald ein Betreiber mehrere Fenster pro Tag hat. Ziel ist eine Matrix, die die Tageslogik direkt sichtbar macht.

## Decision

Wir ersetzen die Timeline-Listen in der Tabelle durch eine Viertelstunden-Matrix:

- Horizontal bleiben `Q1`, `Q2`, `Q3`, `Q4`.
- Vertikal wird der Tag in `96` Slots zu je `15 Minuten` geteilt.
- Jeder Slot bekommt genau einen Bandstatus `NT`, `ST` oder `HT`.
- Die Bandfarben werden konsistent verwendet:
  - `NT` gruen
  - `ST` gelb
  - `HT` rot

## Data Model

Die View-Model-Schicht liefert pro Quartal weiterhin Gruppen- und Summary-Informationen, ergaenzt aber ein explizites Grid-Modell:

- `slots`: 96 Eintraege in Tagesreihenfolge
- pro Slot:
  - `slotIndex`
  - `startLabel`
  - `endLabel`
  - `timeLabel`
  - `bandKey`
  - `bandLabel`
  - `valueCtPerKwh`
  - `isHourStart`

Die Slot-Belegung wird aus den vorhandenen `timeWindows` aufgebaut. Catch-all-Texte wie `Alle anderen Zeiten` fuellen zuvor nicht belegte Slots. Ein Bereich `22:00-00:00` wird korrekt ueber Mitternacht aufgeloest.

## UI

Die Zelle pro Quartal wird als kompaktes Raster dargestellt:

- kleiner Kopf mit `summaryLabel`
- eine schmale Zeitspalte mit Stundenmarken
- daneben die 96 farbigen Slot-Zellen
- Hover/Focus zeigt den Bereich, Bandtyp und Preis

Links im Betreiber-Block bleiben die Preis-Badges sichtbar, erhalten aber dieselbe Farbsemantik wie die Matrix.

## Accessibility

- Jeder Slot bekommt ein `aria-label` mit Quartal, Zeitfenster, Band und Preis.
- Die Matrix bleibt semantisch in der Tabellenstruktur eingebettet.
- Die Farbgebung darf nicht alleinige Information sein; Bandkuerzel bleiben ueber Tooltip/Label zugaenglich.

## Responsive Behavior

- Desktop: kompakte, volle Matrix pro Quartal.
- Mobile: Tabelle bleibt horizontal scrollbar.
- Die Zeitspalte bleibt Teil des jeweiligen Quarter-Blocks, damit kein separates Achsenlayout noetig ist.

## Non-Goals

- Kein Rework der zugrunde liegenden Tarifvalidierung.
- Keine neue interaktive Legende oder Filterlogik fuer Bandtypen.
- Kein Wechsel des Seitenfilters; der bleibt bereits seitenweit aktiv.
