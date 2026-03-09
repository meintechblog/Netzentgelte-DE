# Inline Source Review Design

## Goal

Der Pruefstatus soll ohne aufklappbare Zusatzflaeche direkt im normalen Betreiber-Eintrag verstaendlich lesbar sein.

## Decision

- Der separate Toggle `Quelle & Prüfstatus anzeigen` entfällt.
- Die rechte `Review`-Spalte entfaellt komplett.
- Im Betreiberblock erscheint stattdessen ein kompakter Inline-Abschnitt mit:
  - `Prüfstatus: Geprüft` oder `Prüfstatus: Offen`
  - optionalem Quellenzustand in Klartext, z. B. `Quelle stabil`, `Quelle blockiert`, `Quelle erneut prüfen`
  - Snapshot-/Artefakt-Hinweisen nur wenn vorhanden
- `Quellseite` und `PDF / Dokument` bleiben nur im normalen Eintrag erhalten und werden im Prüfteil nicht dupliziert.

## Non-Goals

- Keine Aenderung an den eigentlichen Source-Daten
- Keine neue Filter- oder Sortierlogik
