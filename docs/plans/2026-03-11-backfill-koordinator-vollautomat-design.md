# Backfill Koordinator Vollautomat Design

**Date:** 2026-03-11

## Goal

Der Backfill-Koordinator soll als stündlicher Vollautomat fehlende Netzbetreiber nicht nur entdecken, sondern sie Schritt fuer Schritt mit belastbaren Quellen, Pending-Public-Sichtbarkeit und spaeterer Promotion versorgen.

## Product Decision

Der Koordinator bekommt einen klaren Funnel:

1. fertig gemeldete Batch-Ergebnisse zuerst integrieren
2. promotable `backfill-ready` Betreiber zuerst weiterziehen
3. danach `registry-review`
4. danach reine `discovery`
5. bei echten integrierten Aenderungen automatisch pruefen, deployen und publizieren

## Operating Model

Der Stundenlauf arbeitet in dieser Reihenfolge:

1. Laufzeitstatus laden
2. alte Blocker frisch pruefen
3. abgeschlossene Worker integrieren
4. freie Arbeits-Slots mit den naechsten Batches fuellen
5. Verifikations-Gate laufen lassen
6. nur bei gruener Verifikation:
   - Commit und Push
   - LXC-Sync und Neustart
   - Import-Sync
   - Public-Snapshot exportieren und statisch deployen
7. Kurzbericht und Lernnotizen schreiben

## What Must Be Automatic

- Auswahl des naechsten sinnvollen Backfill-Batches
- persistente Koordinator-Artefakte unter `docs/coordination/`
- Gate mit Tests, Typecheck, Lint, Public-Export und Build
- Dev-Deploy auf `CT128`
- statischer Publish nach `https://kigenerated.de/netzentgelte/`
- sauberer Fehlerzustand mit wiederaufnehmbarer Fortsetzung

## Safety Rules

- kein Push ohne gruenes Gate
- kein Public-Deploy ohne erfolgreichen Snapshot-Export
- kein stilles Ueberspringen blockierter Schritte
- keine Promotion von `pending` nach `verified`, wenn Evidenz oder Struktur noch nicht reicht
- Infrastrukturfehler bleiben Infrastrukturfehler und werden nicht als Datenfortschritt verkauft

## Missing Piece

Die Projektlogik fuer Batches, Pending-Public und statischen Export ist schon weitgehend da. Es fehlt vor allem die robuste Orchestrierung:

- Automation-Datei neu anlegen oder wiederherstellen
- lokales Koordinator-Skript fuer Dry-Run und echten Lauf
- Tests fuer Statusfluss und Gate-Verhalten
- echter End-to-End-Trockenlauf vor Aktivierung des Stundenjobs
