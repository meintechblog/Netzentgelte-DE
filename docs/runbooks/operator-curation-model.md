# Operator Curation Model

## Goal

Ein einheitliches Vorgehensmodell fuer alle Netzbetreiber-Eintraege, damit Discovery, Korrektur, Erweiterung, Geo-Zuordnung und Publikation nach derselben Logik laufen.

Der Kernsatz ist:

`Bestands-Sanierung vor Neufill, Evidenz vor Extraktion, Audit vor Publikation.`

## Work Queues In Priority Order

1. `Bestands-Sanierung`
   Bereits angelegte oder publizierte Betreiber, die korrigiert, erweitert oder entambiguiert werden muessen.

   Verwende zuerst:
   - [structure-audit](/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/api/operators/structure-audit/route.ts)
   - [endcustomer audit](/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/api/tariffs/endcustomer/audit/route.ts)

2. `Bestehende Shells mit Quelle`
   Betreiber mit vorhandener Quellseite oder PDF, aber noch ohne vollstaendige strukturierte Daten.

3. `Registry-review`
   Neu aus offiziellen Completeness-Feeds aufgetauchte Betreiber, aktuell vorrangig aus der quartalsweisen BNetzA-Roll-out-Liste.

   Verwende:
   - [registry-feed-audit](/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/api/operators/registry-feed-audit/route.ts)
   - [shell-batches](/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/api/operators/shell-batches/route.ts)
   - [backfill-briefing](/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/api/operators/backfill-briefing/route.ts)

4. `Discovery`
   Betreiber ohne belastbare Quelle, nur mit Shell und Linkkandidaten.

5. `Deprecated review`
   Betreiber, die aus einem offiziellen Feed verschwinden oder auf Betreiberseiten nicht mehr als aktiv bestaetigt werden koennen.

## Workflow

### 1. Triage

Fuer jeden Arbeitslauf zuerst bestimmen:

- Ist das ein bestehender Betreiber mit Datenluecke oder Fehler?
- Ist es ein neuer Betreiber aus einem offiziellen Feed?
- Ist es ein Betreiber mit moeglichem Auslauf-/Deprecated-Fall?

### 2. Evidence Capture

Vor jeder Extraktion muessen mindestens erfasst werden:

- offizielle Quellseite
- offizielles Primaerdokument
- `checkedAt`
- `validFrom`, falls vorhanden
- Quelle/Artefakt fuer Geo-Zuordnung, falls eine Flaeche publiziert werden soll

### 3. Structured Extraction

Je nach Betreiber und Dokument werden extrahiert:

- `Modul 1`
- `Modul 2`
- `Modul 3`
- Messpreise
- Quartals- und Zeitfensterlogik
- Geo-Hinweise oder belastbare Coverage-Einheiten

### 4. Validation

Es gibt zwei Regel-Ebenen:

#### A. Pflichtregeln

Ohne diese keine Publikation:

- offizielle Quelle vorhanden
- offizielles Dokument vorhanden
- `validFrom` klar
- Werte haben Rohbelege
- Zeitfenster haben Rohbelege
- Quartalsmatrix ist widerspruchsfrei
- Geo-Zuordnung nur mit belastbarer Quelle

#### B. Projektregeln

Diese duerfen verschaerft werden und muessen dokumentiert bleiben:

- Quartale muessen lueckenlos befuellt sein
- Mitternachtsfenster muessen korrekt ueber `00:00` fortgefuehrt werden
- auslassene Quartale duerfen nur dann als `ST 00:00-24:00` normalisiert werden, wenn die Quelle das belastbar traegt
- kurze Tarifslots duerfen gegen projektspezifische Mindestregeln geprueft werden, zum Beispiel `mindestens 2h pro explizitem Tarifslot`, falls das als aktive Qualitaetsregel beschlossen ist

Projektregeln duerfen nie still implizit sein. Jede neue Regel muss in Skill oder Runbook stehen.

### 5. Publication Decision

- `verified + publishable`: oeffentlich sichtbar
- `pending`: intern weiterfuehren, nicht oeffentlich aufblasen
- `disappearance-review`: intern halten, Betreiberstatus pruefen
- `deprecated`: intern behalten, oeffentlich standardmaessig ausblenden

## Existing Entry Remediation

Bestands-Eintraege duerfen nicht nur "weiterleben", sondern muessen aktiv saniert werden.

Das heisst konkret:

- kaputte Quell- oder Dokumentlinks korrigieren
- bestehende `summaryFallback`-Datensaetze in strukturierte Daten ueberfuehren, wenn die Quelle es traegt
- bestehende Zeitfenster oder Quartalslogik korrigieren, wenn neue Learnings oder bessere Evidenz vorliegen
- bestehende Geo-Zuordnungen pruefen, wenn sie bisher nur angedeutet oder vereinfacht waren
- bestehende Endkundenmodule `1/2/3` und Messpreise vervollstaendigen

## Learning Loop

Wenn ein Betreiberfall eine neue robuste Regel ergibt:

1. in die Skill aufnehmen
2. ins Runbook aufnehmen, wenn projektrelevant
3. offene Bestandsfaelle gegen diese Regel gegenpruefen
4. erst danach den naechsten Batch starten

So wird das Vorgehensmodell nicht nur dokumentiert, sondern operativ wirksam.

## Automation Contract

Der `Backfill Koordinator` arbeitet ab jetzt gegen:

- Hauptpfad: `/Users/hulki/projects/netzentgelte-de` (Branch `main`)
- Dev-Ziel: `root@192.168.3.178:/root/netzentgelte-de`
- Public-Ziel: `https://kigenerated.de/netzentgelte/`

Pflicht-Gate vor jedem automatischen Push/Deploy:

```bash
pnpm test
pnpm typecheck
pnpm exec eslint src scripts
NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public
NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build
```

Persistierte `blocked`-Zustaende sind nie blind zu uebernehmen. Jeder Poll muss den Gate-Fehler frisch revalidieren. Sobald das Gate wieder gruen ist, wird der Blocker geloescht, die wartenden `completed-awaiting-integration`-Batches zuerst integriert und erst danach neuer Dispatch gestartet.

Die Koordinator-Laufzeitdaten (`docs/coordination/claims-board.*`, `docs/coordination/dispatches/`, `docs/coordination/agent-learnings/`) und der exportierte Public-Snapshot unter `public/netzentgelte/` sind lokale Betriebsartefakte. Sie bleiben aus Git heraus, werden pro Lauf frisch erzeugt und nach abgeschlossener Integration zusammen mit temporaeren Batch-Worktrees aufgeraeumt.

Automation-faehige TypeScript-Skripte werden ueber `node --import tsx ...` aufgerufen, nicht ueber das `tsx`-CLI. Der CLI-Pfad versucht in manchen Scheduler-Sandboxes eine IPC-Pipe zum Parent-Prozess zu oeffnen und kann dabei mit `listen EPERM` scheitern.

Koordinator-Einstiegspunkte im Projekt:

```bash
pnpm automation:backfill-koordinator:dry-run
pnpm automation:backfill-koordinator
```

Die stuedliche Codex-Definition liegt unter `/Users/hulki/.codex/automations/backfill-koordinator/automation.toml`.

Pflicht-Deploy-Reihenfolge bei gruener Verifikation und echten integrierten Aenderungen:

1. Git commit + push
2. Sync auf den LXC und Neustart dort
3. `bash scripts/public/deploy-public-static.sh`
4. Nach dem LXC-Deploy Import-Sync ausfuehren, damit neue Eintraege sofort ueber die Dev-API nutzbar sind:
   - `pnpm registry:import`
   - `pnpm shells:import`
5. Live-Checks fuer:
   - `http://192.168.3.178:3000`
   - `http://192.168.3.178:3000/api/operators`
   - `https://kigenerated.de/netzentgelte/`

## Simplified Operations

Ziel ist ein einfacher Dauerbetrieb ohne langlebige Koordinator-Worktrees:

1. Koordinator laeuft direkt im Haupt-Repo auf `main`.
2. Batch-Worker duerfen temporaere Worktrees benutzen.
3. Nach erfolgreicher Batch-Integration werden temporaere Worker-Worktrees entfernt.
4. Produktionsrelevante Aenderungen werden ausschliesslich ueber `main` gepusht und ausgerollt.

Bestandskorrekturen und neue Betreiber werden identisch behandelt. Ein Lauf darf also ebenso gut vorhandene Netzbetreiber reparieren wie neue Backfill-Batches integrieren.
