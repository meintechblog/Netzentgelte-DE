# Full Operator Registry Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Alle vorhandenen Netzbetreiber-Datensaetze gegen die aktuelle Logik und die offiziellen Quellen validieren und nur belastbare Daten als `verified` publizieren.

**Architecture:** Der Audit laeuft in drei Schichten: erst automatisierte Basispruefung der Registry und Links, dann manueller/paralleler Quellenabgleich pro Betreibergruppe, danach konsolidierte Seed- und Testkorrekturen. `verified` bleibt nur bestehen, wenn Links, Bandwerte, Zeitfenster und Review-Status den aktuellen Regeln standhalten; unsichere Faelle werden auf `pending` zurueckgesetzt oder mit besseren Quellen aktualisiert.

**Tech Stack:** JSON seed data, TypeScript/Vitest, curl, pypdf/pdfplumber, offizielle Betreiberseiten und PDFs

## Outcome

Stand 9. Maerz 2026 nach Abschluss des Audits, der direkten NRM-Nachpflege und der naechsten Promotionsrunde:

- `verified`: 26 Betreiber
- `pending`: 7 Betreiber
- `tariffCount` im Import: 78

Wesentliche Entscheidungen:

- Korrigiert und `verified` gehalten: `netze-bw`, `mittelhessen-netz`, `netze-odr`, `stadtwerke-ingolstadt-netze`, `allgaeunetz`
- Neu auf `verified` hochgezogen: `netz-duesseldorf`, `thueringer-energienetze`, `nrm-netzdienste`, `avacon-netz`, `nordnetz`
- Bewusst auf `pending` zurueckgesetzt wegen unvollstaendiger oder nicht belastbar publizierbarer Zeitlogik: `swm-infrastruktur`, `ewr-netz`, `geranetz`, `e-netz-suedhessen`
- Quellen auf aktuellen Stand gezogen, aber weiter `pending`: `syna`, `swe-netz`, `heidelberg-netze`
- Stammdatum korrigiert: `schleswig-holstein-netz` Firmenname auf `Schleswig-Holstein Netz GmbH`
- Source-Handling erweitert: `xlsx` ist jetzt ein erstklassiger Dokumenttyp in Registry, Source-Katalog und Importpfad, damit offizielle PB1-/PB2-Dateien nicht mehr als `html` oder Workaround modelliert werden muessen.

Leitregel aus dem Durchlauf:

- Keine saisonale Vollmatrix inferieren, wenn die offizielle Quelle nur Winterfenster oder nur HT/NT explizit nennt.
- Bei widerspruechlichen oder veralteten Dokumentlinks lieber auf `pending` zurueckgehen als Sommer- oder ST-Zeiten zu erraten.
- `verified` bleibt nur fuer Datensaetze mit belastbaren offiziellen Links, Arbeitspreisen und einer publizierbaren Zeitfensterlogik.
- Wenn die Primaerquelle ein offizielles `xlsx` ist und die Tariflogik darin explizit oder als klarer Komplement-Fall (`ausserhalb HT und NT`) dokumentiert ist, wird der Datensatz direkt auf dieser Basis strukturiert.
- Wenn offizielle Betreiberquellen technisch durch Cloudflare oder andere Anti-Bot-Sperren blockiert sind, wird ohne abrufbaren Primaerbeleg nicht promoted; Such-Snippets oder Error-Pages ersetzen keine Verifikation.

Nachpflege aus der naechsten Audit-Runde:

- `SWE Netz` erneut geprueft: finale 2026-PDF und Tarifwerte sind offiziell vorhanden, aber die Quelle nennt nur HT- und NT-Zeiten fuer `Q1/Q4`; keine belastbare `Q2/Q3`- oder explizite ST-Matrix, daher weiter `pending`.
- `Syna` erneut geprueft: offizielle Pfade auf `syna.de` vorhanden, im Automationslauf jedoch durch Cloudflare-Challenge blockiert. Ohne direkt verifizierbaren Primaerabruf bleibt der Datensatz vorerst `pending`.
- `Avacon Netz` promoted: die offizielle Seite weist die Datei explizit als endgueltige Netzentgelte 2026 aus, und das offizielle Preisblatt sVE dokumentiert auf Seite 12 alle drei Tarifstufen inklusive Q1-Q4-Logik.
- `NORDNetz` promoted: die offizielle 2026-Seite verweist auf das finale Strom-PDF; Seite 14 enthaelt die vollstaendige Modul-3-Matrix mit Q1/Q4-Zeitfenstern sowie Q2/Q3 als Standardtarif 00:00-24:00 Uhr.
- `Heidelberg Netze` bleibt `pending`: das offizielle Preisblatt dokumentiert Modul 3 nur fuer `Q3 und Q4` und nennt selbst, dass die Abrechnung auf einzelne Quartale begrenzt sein kann; fuer `Q1/Q2` fehlt damit die publizierbare Jahresmatrix.
- Die verbleibenden `pending`-Faelle mit nur teilweiser oder access-blockierter Evidenz (`swm-infrastruktur`, `heidelberg-netze`, `ewr-netz`, `geranetz`, `e-netz-suedhessen`, `syna`, `swe-netz`) wurden auf source-only/Fallback-Datensaetze reduziert; unvollstaendige Band- und Zeitfenstermatrizen werden nicht mehr in den Import exportiert.

---

### Task 1: Baseline Audit Inputs

**Files:**
- Create: `tmp/audit/operator-link-audit.tsv`
- Create: `tmp/audit/operator-registry-snapshot.json`

**Step 1: Capture the current registry state**

Export all operators with slug, reviewStatus, source URLs, band count and time-window count.

**Step 2: Check source page and document URLs**

Probe every page/document URL and record status codes or hard failures.

**Step 3: Identify audit buckets**

Split into:
- `verified` entries needing source re-check
- `pending` entries that may now be promotable
- broken-link or ambiguous-link cases

### Task 2: Parallel Source Audit

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `src/modules/operators/registry.test.ts`

**Step 1: Audit verified entries in operator batches**

For each batch:
- confirm official page and document URLs
- confirm `validFrom`
- confirm `NT`/`ST`/`HT`
- confirm time-window matrix against current logic
- downgrade to `pending` or fix source data if evidence is weak

**Step 2: Audit pending entries for promotion**

Promote only when the current official source fully supports the structured data.

**Step 3: Extend tests**

Add or update focused assertions for changed operators and changed publication counts.

### Task 3: Import And Publication Surface Alignment

**Files:**
- Modify: `src/modules/operators/registry-import.test.ts`
- Modify: `src/app/api/operators/route.test.ts`
- Modify: `src/app/api/tariffs/current/route.test.ts`

**Step 1: Update import-count expectations**

Adjust tariff row totals and any operator-specific assertions after audit changes.

**Step 2: Update publishable API expectations**

Reflect the real post-audit `verified` set and keep unresolved operators hidden.

### Task 4: Verification

**Files:**
- None

**Step 1: Run core verification**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/registry-import.test.ts src/app/api/operators/route.test.ts src/app/api/tariffs/current/route.test.ts
```

Expected: PASS

**Step 2: Spot-check operator integrity**

Re-read changed entries and confirm they still satisfy the runbook and global filling skill.
