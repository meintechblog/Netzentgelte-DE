# Source Health Check Design

**Date:** 2026-03-09

## Goal

Fruehe Sichtbarkeit fuer riskante oder blockierte Quellen schaffen, ohne den bestehenden Publish-Pfad von Live-Netzwerkpruefungen oder flakey URL-Checks abhaengig zu machen.

## Decision

Wir setzen einen hybriden Ausbaupfad auf, liefern jetzt aber nur Phase 1 aus:

- deterministischer Regel-Check im `sources`-Modul
- Health-Report direkt an aktuellen Quellen sichtbar
- kein Live-Netzwerkzugriff im Kernpfad oder in Tests
- optional spaeter ergaenzbarer Live-Runner fuer echte URL-Statuschecks

## Why This Approach

- Die aktuelle Registry hat bereits dokumentierte Guardrails fuer Cloudflare, Teilquartale und source-only `pending`-Faelle.
- Diese Regeln lassen sich lokal und reproduzierbar aus Seed, Notes, Snapshots und URL-Struktur ableiten.
- Ein sofortiger Live-Check wuerde Teststabilitaet verschlechtern und den Kernpfad unnötig an externe Betreiberseiten koppeln.

## Scope

### In Scope

- neues `source-health`-Modul mit flachem, serialisierbarem Report
- Klassifikation in `ok`, `warning`, `blocked`
- strukturierte `issues` fuer bekannte Problemklassen
- Integration in `CurrentSource`
- Ausgabe in `/api/sources/current`
- Seed- und Testabdeckung fuer typische Audit-Faelle

### Out of Scope

- kein automatisches `HEAD`/`GET` gegen Live-URLs
- keine harte Publish-Blockade
- keine DB-Migration fuer persistierte Health-Historie

## Data Shape

Jede Quelle erhaelt einen `healthReport` mit:

- `status`: `ok` | `warning` | `blocked`
- `issues`: Liste aus maschinenlesbarem `key`, kurzer `message` und optionalem `detail`

Geplante Issue-Typen:

- `access_blocked`
- `pending_source_only`
- `snapshot_missing`
- `document_type_mismatch`
- `document_url_suspicious`

## Rule Sources

Der Report nutzt nur lokal verfuegbare Evidenz:

- `pageUrl`, `documentUrl`, `reviewStatus`, `checkedAt`
- Snapshot-Metadaten aus `CurrentSource`
- bekannte Access-Hinweise aus Seed-Notes und Fallback-Texten
- Datei- und URL-Muster

## Integration

- neues Modul unter `src/modules/sources/source-health.ts`
- `src/modules/sources/current-sources.ts` haengt den Report an Seed- und DB-Quellen
- `src/lib/api/serializers.ts` serialisiert den Report
- `src/app/api/sources/current/route.ts` bleibt unveraendert, weil der Serializer die neue Form liefert

## Testing

- neue Unit-Tests fuer das Regelwerk
- bestehende API-Tests erweitern um `healthReport`
- Fokusfaelle:
  - verifizierte stabile PDF-Quelle -> `ok`
  - Syna/Cloudflare -> `blocked`
  - source-only `pending` -> `warning`
  - gecheckte Quelle ohne Snapshot-Artefakt -> `warning`

## Follow-Up

Wenn sich der Report bewaehrt, folgt ein optionaler Live-Runner als zweite Phase. Dieser sollte getrennt vom Publish-Pfad laufen und Artefakte oder Status nur als Zusatzsignal liefern.
