# Source Live Audit Runner Design

**Date:** 2026-03-09

## Goal

Einen getrennten Live-Audit-Runner fuer Betreiberquellen bereitstellen, der echte Abrufsignale wie HTTP-Status, Redirects und Content-Type bewertet, ohne den stabilen Publish-Kernpfad davon abhaengig zu machen.

## Decision

Wir erweitern den bestehenden Refresh-Stack um einen separaten Audit-Layer:

- Live-Fetch fuer Page und Document pro Quelle
- strukturierte Audit-Diagnosen pro Quelle
- Snapshot-Persistenz bei erfolgreichen Abrufen
- keine Kopplung an den Publish-Pfad

## Why This Approach

- `refresh-pipeline` und `refresh-runner` enthalten bereits die richtigen Integrationspunkte fuer Fetch, Artefaktpersistenz und Run-Bookkeeping.
- Ein separater Audit-Layer vermeidet Logikduplikation und haelt Diagnoseverhalten klar von Publish- oder Seed-Regeln getrennt.
- Erfolgreiche Abrufe sollen direkt nutzbare Artefakte hinterlassen, statt einen zweiten Fetch-Lauf zu erzwingen.

## Scope

### In Scope

- neues Audit-Modul fuer Live-Diagnosen
- pro Quelle strukturierter Status wie `ok`, `warning`, `blocked`
- Issues fuer 403/401, Redirect, unerwarteten Content-Type und Fetch-Fehler
- Snapshot-Persistenz bei erfolgreichen Antworten
- Run-Summary fuer den Runner

### Out of Scope

- keine UI-Integration in dieser Runde
- keine Persistenz eines eigenen Audit-History-Schemas
- keine Live-Checks im Request-/API-Kernpfad

## Data Flow

1. Runner waehlt Quellen aus.
2. Audit-Pipeline fetched Page und Document.
3. Responses werden live klassifiziert.
4. Bei erfolgreichen Responses werden Snapshots wie im Refresh-Pfad persistiert.
5. Fuer jede Quelle entsteht ein Audit-Result mit Status, Issues und Snapshot-Zahlen.
6. Runner aggregiert die Results zu einer schlanken Summary.

## Result Shape

Geplant:

- `status`: `ok` | `warning` | `blocked`
- `issues`: flache maschinenlesbare Liste
- `page`/`document` Teilresultate mit Statuscode, finaler URL und Content-Type
- `snapshotCount`

## Testing

- 403/Cloudflare-Block -> `blocked`
- Redirect oder HTML statt PDF -> `warning`
- erfolgreicher Page-/Document-Fetch -> `ok` plus Snapshot-Persistenz
- Runner-Summary aggregiert Ergebnisse korrekt
