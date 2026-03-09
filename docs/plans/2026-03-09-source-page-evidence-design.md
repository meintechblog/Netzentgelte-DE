# Source Page Evidence Design

## Goal

Neben dem Originaldokument auch die Quellseite selbst als reviewbares Artefakt speichern, damit page-level Aussagen wie "endgueltige Netzentgelte 2026" spaeter nachvollziehbar und im UI pruefbar bleiben.

## Approaches

### 1. Nur `notes` erweitern

Schnell, aber nicht reviewbar genug. Der Nutzer sieht dann weiterhin nur unsere Interpretation, nicht den gespeicherten Beleg.

### 2. Bestehenden Snapshot-Pfad auf zwei Artefaktrollen erweitern

Empfohlen. Pro Quelle werden bei einem Refresh zwei Snapshots angelegt: `page` fuer die HTML-Quellseite und `document` fuer das Originaldokument. Beide bekommen eigenen Hash, Storage-Pfad und UI-Link.

### 3. Neues Evidence-Subsystem mit separaten Tabellen fuer Quotes, Entscheidungen und Artefaktrollen

Langfristig attraktiv, fuer diesen Slice aber zu breit. Wir brauchen zuerst gespeicherte Rohbelege, bevor wir weitere Review-Workflows aufbauen.

## Decision

Ansatz 2. `source_snapshots` bekommt eine explizite Artefaktrolle, der Refresh speichert HTML plus Dokument, und API/UI zeigen beide Belege getrennt an. Ein spaeterer Quote-Extractor kann dann auf diese gespeicherten HTML-Artefakte aufsetzen.

## Scope

- DB-Schema um Snapshot-Rolle erweitern
- Refresh-Pipeline fuer `page` und `document`
- Current-sources Read-Model fuer zwei Artefaktpfade
- Quellenpruef-UI mit getrennten Links fuer Seiten-Snapshot und Dokument-Snapshot
- Tests fuer Snapshot-Erzeugung, Persistenz und View-Model

## Verification

- `pnpm vitest run src/modules/sources/refresh-service.test.ts src/modules/sources/refresh-pipeline.test.ts src/modules/sources/current-sources.test.ts`
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`
