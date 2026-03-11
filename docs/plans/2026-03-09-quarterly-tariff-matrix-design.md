# Quartalsmatrix Design

## Ziel

Die Tarif-Fenster in der Webapp sollen kompakt, fachlich korrekt und klarer lesbar werden. `Stadtwerke Schwäbisch Hall` dient dabei als Referenzquelle. Die Darstellung lehnt sich an das veröffentlichte Preisblatt an: tarifstufenbasiert, quartalsbezogen und mit den jeweils zugehörigen Uhrzeiten.

## Entscheidungen

- Die UI zeigt Tarif-Fenster künftig immer quartalsbasiert als `Q1`, `Q2`, `Q3`, `Q4`.
- Ganzjährige oder saisonal zusammengefasste Fenster werden auf die betroffenen Quartale expandiert.
- `Stadtwerke Schwäbisch Hall` wird fachlich exakt nach dem PDF abgebildet:
  - `Q1`, `Q2`, `Q4`: `Standardtarif`, `Hochtarif`, `Niedrigtarif`
  - `Q3`: ausschließlich `Standardtarif 00:00-24:00`
- Die bisherige hohe Kartenstapel-Ansicht wird durch eine kompakte Quartalsmatrix ersetzt.
- Die Quellenlinks bleiben pro Betreiber sichtbar, aber die Zeitfenster rücken als eigentliche Kerninformation stärker in den Vordergrund.

## UI

- Jede Betreiberzeile zeigt weiter Name, Region, Gültigkeit, Quelle und Review.
- Die Tarifspalte rendert statt hoher Fensterkarten eine dichte Matrix:
  - Kopf mit `Q1`, `Q2`, `Q3`, `Q4`
  - innerhalb jedes Quartals Tarifgruppen mit Preis und einer Liste der Uhrzeiten
- Tarifgruppen werden farblich dezent codiert:
  - `ST` neutral
  - `HT` akzentuiert
  - `NT` gedämpft
- Wenn ein Quartal nur `Standardtarif` hat, wird dort genau dieser reduzierte Block gezeigt.

## Datenmodell im UI

- Das persistierte Datenmodell bleibt unverändert.
- Ein neues View-Model expandiert `timeWindows` nach Quartalen.
- Die Expansion basiert auf den bestehenden `seasonLabel`-Angaben.
- Zusätzlich wird pro Quartal auf die bekannten Bandpreise gemappt, damit Zeitblock und Preis im selben UI-Baustein stehen.

## Fachliche Leitregel für Schwäbisch Hall

Source of truth ist das Preisblatt `4NNE_STW-SHA_ab_01.01.2026.pdf`.

- `NT 1,11 ct/kWh`: `00:00-07:00`, `22:00-00:00`
- `ST 5,53 ct/kWh`: `07:00-10:00`, `14:00-18:00`, `20:00-22:00`
- `HT 8,14 ct/kWh`: `10:00-14:00`, `18:00-20:00`
- Zusatzregel: Die drei Tarifstufen werden nur in `Q1`, `Q2` und `Q4` abgerechnet. In `Q3` erfolgt die Abrechnung vollständig zum `Standardtarif`.

## Teststrategie

- Unit-Tests für die Quartalsexplosion aus `seasonLabel`-Daten
- Regressionstest für `Stadtwerke Schwäbisch Hall` mit korrekten Quartalsinhalten
- Komponententest für die neue Matrixdarstellung
- Bestehende API-/View-Model-Tests bleiben grün
