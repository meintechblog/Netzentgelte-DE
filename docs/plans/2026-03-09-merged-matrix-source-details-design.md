# Merged Matrix And Source Details Design

**Date:** 2026-03-09

## Goal

Die getrennte Kategorie `Quellenprüfung` soll in den Hauptbereich der Betreiberdaten integriert werden, damit Tarifmatrix und Quellen-/Prüfstatus je Netzbetreiber zusammen sichtbar sind und durch dasselbe Suchfeld gefiltert werden.

## Decision

Wir führen die Seite auf einen einzigen, zentral gefilterten Betreiberbereich zusammen:

- eigener Block `Quellenprüfung` entfällt
- bisherige `Aktuelle Tarifmatrix` wird in einen breiter passenden Bereich umbenannt
- pro Betreiber gibt es einen standardmäßig zugeklappten Detailblock für Quelle und Prüfstatus
- das bestehende Suchfeld gilt seitenweit für diese gesamte Betreiberliste

## Why This Approach

- Tarifdaten und Quellenevidenz gehören fachlich zusammen und sollten nicht in zwei unabhängigen Listen gepflegt werden.
- Eine zentrale Suchlogik ist verständlicher als getrennte Filterdomänen.
- Ein kompakter Expand-Bereich hält die Standardansicht ruhig, ohne die Quellentransparenz zu verlieren.

## Scope

### In Scope

- Umbenennung des bisherigen Tarifbereichs
- Entfernen des separaten `Quellenprüfung`-Blocks
- Integration der Source-Information in die Betreiberdarstellung
- standardmäßig zugeklappte Quelle-/Prüfstatus-Details pro Betreiber
- seitenweiter Filter über dieselbe Suchlogik

### Out of Scope

- kein neuer globaler State-Store
- keine neue API für zusammengesetzte Betreiber-/Quellendaten
- keine Änderung der zugrunde liegenden Source-Health- oder Registry-Logik

## UI Shape

Jeder Betreiberblock zeigt standardmäßig:

- Betreibername
- Region
- Tarifstatus / Review-Status
- Tarifbänder und Zeitfenster wie bisher

Zusätzlich gibt es einen Trigger, z. B. `Quelle & Prüfstatus anzeigen`, der nach unten einen kompakten Detailbereich öffnet. Dieser Bereich zeigt:

- Review-Status der Quelle
- zuletzt geprüft
- Quellseite
- Dokument
- Snapshot-/Artefakt-Links, falls vorhanden
- Health-Status und kurze Issues, wenn relevant

## Search Behavior

Das bestehende Suchfeld filtert den gesamten Betreiberbereich. Es matcht mindestens auf:

- Betreibername
- Region
- Slug
- Quellen-URLs
- Source-Slug

Damit verschwinden Betreiber ohne Match komplett aus der Liste, unabhängig davon, ob der Match in Tarifdaten oder in den integrierten Quellendetails liegt.

## Component Impact

- `src/app/page.tsx`: separaten Quellenblock entfernen
- `src/components/operator-explorer.tsx`: Suchlogik auf kombinierte Betreiber-/Quelleninfos ausweiten
- `src/components/tariff-table.tsx`: Betreiberdarstellung um expandierbaren Quellendetailblock erweitern
- `src/components/source-review-table.tsx`: entfällt oder wird aufgelöst

## Testing

- Suchfeld filtert den zusammengeführten Bereich
- separater Quellenblock ist nicht mehr sichtbar
- ein Betreiber kann Quellendetails auf- und zuklappen
- Quellendetails sind initial zugeklappt

