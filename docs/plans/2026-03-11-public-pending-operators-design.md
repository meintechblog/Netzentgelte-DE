# Public Pending Operators Design

**Date:** 2026-03-11

## Goal

Den `Backfill Koordinator` von einem reinen Intake-/Shell-Backfill-Automaten zu einem durchgaengigen Betreiber-Funnel erweitern: neue Netzbetreiber sollen automatisch im Projekt ankommen, auf Dev importiert werden, auf der oeffentlichen Hetzner-Seite als `in Pruefung` sichtbar werden und bei spaeterer belastbarer Evidenz automatisch in die bestehende `verified/publishable`-Liste aufsteigen.

## Product Decision

Neue oder unvollstaendig gepruefte Betreiber werden nicht in die bestehende oeffentliche Tarifliste gemischt. Stattdessen gibt es zwei oeffentliche Flaechen:

1. `verified/publishable` Betreiber in der bestehenden Liste und API.
2. `pending public` Betreiber in einer separaten oeffentlichen Uebersicht mit Minimaldarstellung.

Die Pending-Flaeche zeigt nur Discovery- und Review-Status, keine halbgaren Tarifmatrizen.

## Why This Design

Die bestehende Public-Integrity-Logik ist richtig: unvollstaendige oder nicht belastbar belegte Tarifdaten duerfen nicht in die Standardliste gelangen. Gleichzeitig reicht ein rein interner Shell-Backfill nicht aus, wenn das Produktziel eine fortlaufend wachsende, sichtbar arbeitende Betreiberabdeckung ist. Die separate Pending-Flaeche loest beide Anforderungen:

- keine Aufweichung der `verified/publishable`-Gates
- neue Betreiber werden trotzdem automatisch oeffentlich sichtbar
- der Koordinator kann end-to-end arbeiten, ohne zweideutige Public-Tarifdaten zu publizieren

## Public Model Split

### Verified Surface

Bleibt unveraendert:

- gespeist aus dem bestehenden publishable Operator-Snapshot
- sichtbar in Webapp, `/api/operators`, Public Snapshot und bestehenden Kennzahlen
- nur `verified` plus alle Integritaetsregeln bestanden

### Pending Surface

Neu:

- separate Seite fuer `in Pruefung`
- separate API fuer public-pending Betreiber
- minimaler Datenumfang
- keine `bands`, keine `timeWindows`, keine Teilmatrizen

## Pending Inclusion Rules

Ein Betreiber darf nur in der neuen oeffentlichen Pending-Flaeche erscheinen, wenn alle folgenden Bedingungen gelten:

- kein ausgeschlossener Transmission-Operator
- nicht `deprecated`
- sinnvoller Betreibername vorhanden
- aus offiziellem Feed oder belastbarer Discovery-Arbeit entstanden
- nicht bereits `publishable`

Die Pending-Flaeche soll keine rohe interne Shell-Liste spiegeln. Sie ist eine gefilterte oeffentliche Arbeitsansicht.

## Pending Public Fields

Die oeffentliche Pending-Ansicht wird auf wenige stabile Felder reduziert:

- `slug`
- `name`
- `regionLabel`
- `reviewStatus`
- `sourceStatus`
- `tariffStatus`
- optional `websiteUrl`
- optional `checkedAt`

Optional kann spaeter ein menschenlesbarer Arbeitsstatus aus den bestehenden Statusfeldern abgeleitet werden, zum Beispiel `Neu entdeckt`, `Quelle gefunden`, `Pruefung laeuft`. Diese Darstellung bleibt rein summarisch.

## Data Sources

- `data/source-registry/operators.seed.json` bleibt die kuratierte Registry fuer verifizierbare Betreiberdaten.
- `data/source-registry/operator-shells.seed.json` bleibt die Intake- und Arbeitsquelle fuer Discovery, Quellenstatus und Fortschritt.
- Der neue `pending public` Read-Model-Pfad wird aus den Shells abgeleitet, aber deutlich enger gefiltert als die interne Shell-API.

## Promotion Lifecycle

Der gewuenschte Betreiber-Lebenszyklus ist:

1. offizieller Feed oder Discovery erkennt Betreiber
2. Koordinator legt/aktualisiert Shell- und Registry-Artefakte an
3. Betreiber erscheint automatisch in der Pending-Public-Flaeche
4. spaetere Batches ziehen offizielle Quellen und strukturierte Daten nach
5. sobald der Betreiber `verified/publishable` ist, verschwindet er automatisch aus der Pending-Flaeche und erscheint in der bestehenden Public-Liste

Damit gibt es nie eine doppelte oeffentliche Darstellung desselben Betreibers.

## Coordinator Behavior

Der stuedliche Koordinator arbeitet kuenftig in dieser Prioritaet:

1. persistierte Blocker revalidieren
2. fertige Claims integrieren
3. promotable `pending` Betreiber priorisiert dispatchen
4. danach neue Discovery-/Shell-Batches dispatchen
5. bei echtem integrierten Aenderungsstand Gate, Push, Dev-Deploy, Import-Sync und Hetzner-Public-Deploy ausfuehren

Ein erfolgreicher Lauf bedeutet damit nicht nur interne Shell-Fortschritte, sondern sichtbare oeffentliche Bewegung:

- neue Betreiber werden auf der Pending-Seite sichtbar
- verbesserte Betreiber steigen automatisch in die verifizierte Liste auf

## New Public Endpoints

### API

Neue Route:

- `/api/operators/pending`

Antwortinhalt:

- `items`: gefilterte public-pending Betreiber
- `summary`: Kennzahlen fuer diese Menge

Die bestehende `/api/operators/shells` bleibt intern/arbeitsnah und darf deutlich mehr Felder enthalten.

### UI

Neue Seite:

- `/netzbetreiber/in-pruefung`

Sie wird in den statischen Export und den Hetzner-Deploy aufgenommen. Der Inhalt ist absichtlich simpel: Statusuebersicht statt Tarifvergleich.

## Error Handling

- Betreiber mit unklarer oder blockierter Primaerquelle bleiben `pending` und damit hoechstens in der Pending-Flaeche sichtbar.
- Betreiber ohne ausreichende Minimaldaten erscheinen weder in der normalen Public-Liste noch in der Pending-Flaeche.
- Bei Gate-, Push- oder Deploy-Fehlern bleibt die bereits veroeffentlichte Hetzner-Flaeche konsistent; der Koordinator darf keine teilweise neue Public-Sicht behaupten.

## Testing Requirements

Die Aenderung braucht mindestens diese Testschichten:

- Read-Model-Tests fuer Pending-Filterung und Ausschluss publishabler Betreiber
- API-Route-Tests fuer `/api/operators/pending`
- Seiten-/Snapshot-Tests fuer die neue oeffentliche Pending-Seite
- Koordinator-/Batch-Priorisierungstests fuer `promotion first, discovery second`
- Integritaetstest, dass ein `verified/publishable` Betreiber nie gleichzeitig in Pending und Verified-Public auftaucht

## Documentation Impact

Aktualisiert werden muessen:

- Runbook zum Operator-Curation-Modell
- Automation-Prompt/Contract des `Backfill Koordinator`
- gegebenenfalls Public-API- und Release-Dokumentation

## Rollout Strategy

1. neuen Pending-Public-Read-Model-Pfad einfuehren
2. neue API und Public-Seite ausliefern
3. Koordinator-Priorisierung auf Promotion-vor-Discovery umstellen
4. Automation-Prompt und Runbooks anpassen
5. End-to-end mit Gate, Dev-Deploy und Hetzner-Deploy verifizieren
