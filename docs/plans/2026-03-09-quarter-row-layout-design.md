# Quarter Row Layout Design

## Goal

Die Quartalsmatrix soll auf Desktop immer als feste Viererreihe `Q1 | Q2 | Q3 | Q4` erscheinen. Die bisherige separate Quellen-Spalte gibt dafür ihren Platz auf; Quellen- und Prüfpfad wandern kompakt unter den Betreiberblock.

## Decision

- Tabellenstruktur wird zu: `Netzbetreiber | Q1 | Q2 | Q3 | Q4 | Review`
- `Quelle` wird keine eigene Hauptspalte mehr
- Quellseite, PDF, Check-Zeitpunkt und `sourceSlug` stehen direkt im Betreiberblock links
- Desktop priorisiert Vergleichbarkeit der vier Quartale
- Mobile darf horizontal scrollen

## Rationale

Die eigentliche Fachinformation ist der Quartalsvergleich. Eine breite Quellen-Spalte neben einer vertikal hohen Matrix verschwendet Platz und verschlechtert die Scanbarkeit. Die Quelle bleibt sichtbar, aber in einer logischeren Position: direkt beim Betreiber, dessen Daten sie belegt.

## UI Shape

- Linke Zelle:
  - Betreibername
  - Region
  - Slug
  - `Quellseite`
  - `PDF / Dokument`
  - `Zuletzt geprüft ...`
  - `Quelle ...`
- Vier Matrixzellen:
  - je Quartal ein kompakter Tarifblock
  - keine Umbrüche in mehrere Zeilen auf Desktop
- Rechte Zelle:
  - Review-Pill

## Constraints

- Schwäbisch Hall bleibt Referenzfall für `Q3 = Nur Standardtarif`
- Links dürfen nicht verloren gehen oder erst in einem zweiten Schritt sichtbar werden
- Öffentliche verified-only Gating-Logik bleibt unverändert

