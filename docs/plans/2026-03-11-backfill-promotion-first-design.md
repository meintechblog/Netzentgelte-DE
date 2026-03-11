# Backfill Promotion First Design

**Date:** 2026-03-11

## Goal

Die Backfill-Steuerung soll promotable Betreiber vor reiner Intake-Arbeit ziehen. Konkret sollen `backfill-ready` Shell-Batches vor `registry-review` und `discovery` empfohlen werden, wenn damit oeffentlich sichtbare Pending-Betreiber schneller Richtung verifizierbare Quelle bewegt werden.

## Decision

Wir ziehen die Prioritaet konsistent an zwei Stellen hoch:

1. `buildShellBackfillBatches` liefert `backfill-ready` vor `registry-review`.
2. `buildBackfillBriefing` empfiehlt zuerst den ersten `backfill-ready` Batch, danach `registry-review`.

Damit benutzen interne Batch-Listen und die oeffentliche/koordinatorische Empfehlung dieselbe Reihenfolge.

## Why

- Die bestehende Public-Pending-Flaeche lebt davon, dass bereits gefundene Betreiber schnell auf belastbare Quellen angehoben werden.
- `registry-review` bleibt wichtig, ist aber weniger nah an einer sichtbaren Promotion als `backfill-ready`.
- Eine Teilumstellung nur im Briefing wuerde zu widerspruechlichem Verhalten zwischen Batch-Liste und API-Empfehlung fuehren.

## Scope

- Tests in `shell-batches`, `backfill-briefing` und der Backfill-Briefing-API anpassen
- minimale Aenderung an der Sortierung/Empfehlung
- keine Aenderung an den Lane-Definitionen selbst
- keine Aenderung am Batch-Zuschnitt pro Host
