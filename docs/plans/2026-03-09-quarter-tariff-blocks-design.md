# Quarter Tariff Blocks Design

## Goal

Die Quartalsansicht soll statt einzelner 15-Minuten-Zellen zusammenhaengende Tarifbloecke zeigen, dabei aber weiterhin auf dem Viertelstundenraster basieren.

## Decision

- Die zugrunde liegenden `96` Slots bleiben im View-Model erhalten.
- Fuer die UI werden benachbarte Slots mit identischem Tarif zu Segmenten komprimiert.
- Links erscheinen nur noch `4h`-Marken als Achse: `00, 04, 08, 12, 16, 20, 24`.
- Jeder Segmentblock zeigt Band und Zeitfenster direkt im Block, damit Anfang und Ende visuell klar bleiben.

## Non-Goals

- Keine Aenderung an Tarifvalidierung oder Bandfarben
- Kein Verlust der Viertelstunden-Praezision im Datenmodell
