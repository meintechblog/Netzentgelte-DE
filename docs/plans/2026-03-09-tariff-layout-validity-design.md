# Tarif Layout Validity Design

## Ziel

Die Quartalsmatrix soll fachlich lesbar und visuell stabil sein: keine horizontal aus dem Viewport laufenden Elemente, chronologisch sortierte Zeitfenster pro Quartal und eine kompaktere Preiszusammenfassung im Betreiberblock.

## Probleme im Ist-Zustand

- Die feste Tabellenbreite ist groesser als die effektive Seitenbreite und erzeugt horizontales Ausbrechen.
- Die Preiszusammenfassung als Fliesstext (`NT ... · ST ... · HT ...`) verbraucht zu viel Breite.
- Quellen- und Metadaten koennen den Betreiberblock unnoetig aufziehen.
- Zeitfenster werden in der Reihenfolge der Seed-Daten gezeigt, nicht hart nach Uhrzeit.

## Zielbild

- Breite Viewports behalten eine echte Vergleichstabelle mit `Q1`, `Q2`, `Q3`, `Q4` nebeneinander.
- Schmalere Laptop- und Tablet-Breiten schalten auf kompakte Betreiber-Cards mit einem `2x2`-Quartalsgrid um.
- Der Betreiberblock zeigt kompakte Preis-Badges statt eines langen Monospace-Satzes.
- Zeitfenster werden pro Tarifgruppe chronologisch sortiert; Sammelbezeichnungen wie `Alle anderen Zeiten` oder `Alle restlichen Zeiten` stehen am Ende.
- Lange technische Strings werden umbruchfaehig gemacht, damit nichts horizontal uebersteht.

## UI-Entscheidungen

- Der Desktop-Tisch bleibt erhalten, aber mit deutlich engeren Spalten und kompakteren Quartalskarten.
- Unterhalb eines passenden Breakpoints wird die Tabelle semantisch erhalten, visuell aber in gestapelte Cards ueberfuehrt.
- `ct/kWh` wird im Betreiberblock nicht mehrfach als Teil eines langen Satzes wiederholt, sondern in kompakten Badges mit Tarifkuerzel und Wert angezeigt.
- Quellenmeta bleibt beim Betreiber, aber in kleinerem, sauber umbrechendem Stil.

## Daten-/Read-Model

- Die Quartalsmatrix bekommt eine harte Sortierung fuer `timeRanges`.
- Der Tarif-View-Model-Row enthaelt zusaetzlich kompakte Band-Badges fuer die Betreiberzusammenfassung.

## Verifikation

- Unit-Tests fuer die Chronologie der Zeitfenster.
- Komponenten-Tests fuer kompakte Preis-Badges und die chronologische Reihenfolge in der Quartalszelle.
- Browser-Check auf fehlenden horizontalen Page-Overflow bei mehreren Viewport-Breiten.
