# Netzentgelte Deutschland

Zentrale Datenplattform fuer deutsche Stromnetzbetreiber mit Fokus auf `§14a`-Netzentgelte, Quellenpruefung und nachvollziehbare Publikation. Das Projekt sammelt Betreiberdaten, Preisblaetter, Tariflogiken und Flaechenhinweise in einer eigenen Datenbasis und spielt einen verifizierten Oeffentlichkeitsstand als Webapp aus.

Live:

- Public: [kigenerated.de/netzentgelte](https://kigenerated.de/netzentgelte/)
- Bestehende Schwester-App: [kigenerated.de/prince2-vorbereitung](https://kigenerated.de/prince2-vorbereitung)
- Entwicklung: `http://192.168.3.178:3000`

## Was das Projekt macht

- sammelt Netzbetreiber-Eintraege fuer Deutschland in einer eigenen Registry
- strukturiert `§14a Modul 3`-Tarife mit Quartalen, Zeitfenstern und Quellenbelegen
- baut ein erweitertes Endkundenmodell fuer `Modul 1`, `Modul 2`, `Modul 3` und Messpreise auf
- zeigt verifizierte Daten in einer Webapp als Tarifmatrix, Karte, Quellenpruefung und Regelwerk
- fuehrt Bestandskorrekturen und neue Betreiber-Backfills in denselben Qualitaetsprozess

## Aktueller Stand

- `73` Betreiber sind im aktuellen Public-Snapshot sichtbar
- `891` Netzbetreiber-Shells sind in der internen Registry angelegt
- die Public-Webapp laeuft statisch unter `kigenerated.de/netzentgelte`
- Entwicklung, Datenpflege, Compliance und Refresh-Jobs laufen auf dem LXC

Wichtig: Nicht jede intern bekannte Shell ist bereits oeffentlich publiziert. Oeffentlich sichtbar werden nur Betreiber, die die aktuellen Evidenz- und Integritaets-Gates erfuellen.

## Kernfunktionen

### Tarifmatrix

- Quartalsansicht `Q1` bis `Q4`
- 24h-Blockansicht fuer `Modul 3`
- Zeitfenster- und Restzeitlogik
- Mobile- und Desktop-Darstellung

### Deutschlandkarte

- interaktive Uebersicht fuer bereits belastbar zugeordnete Flaechen
- Fokus-/Lock-Verhalten fuer Betreiberdetails
- Karte und Suche greifen auf denselben Datenstand zu

### Quellenpruefung

- Quellseiten und Preisblatt-Links
- Snapshot-/Artefaktpfad fuer spaetere Audits
- Human-in-the-loop-Pruefbarkeit statt Black-Box-Import

### Regelwerk / Compliance

- Vergleich gegen das hinterlegte `BDEW Anwendungshilfe Modul 3 1.1`-Regelwerk
- regelkonform / mit Verstoessen / nicht bewertbar
- bestehende Daten koennen nach besseren Learnings oder Rundungsregeln neu bewertet werden

## Qualitaetsmodell

Das Projekt folgt nicht dem Muster `moeglichst viel sichtbar`, sondern `nur belastbare Daten oeffentlich`.

Konkret bedeutet das:

- offizielle Quelle vor Extraktion
- strukturiertes Modell statt freier PDF-Abschriften
- Quartale und Zeitfenster muessen widerspruchsfrei sein
- Mitternachtsfenster werden ueber `00:00` korrekt fortgefuehrt
- Bestandsdatensaetze duerfen und muessen aktiv korrigiert werden
- nur verifizierte und publizierbare Datensaetze landen im oeffentlichen Snapshot

Mehr dazu:

- [Operator Curation Model](docs/runbooks/operator-curation-model.md)
- [Hetzner Production Rollout](docs/runbooks/hetzner-prod-rollout.md)

## Architektur

### Entwicklung und Datenarbeit

- aktiver Entwicklungsstand: LXC `CT128`
- Pfad dort: `/root/netzentgelte-de`
- lokale Arbeit hier im Repo dient vor allem der Steuerung, Dokumentation und Git-Integration

### Anwendung

- `Next.js` + `TypeScript`
- `Vitest` fuer Tests
- `ESLint` fuer statische Checks
- `Postgres` / `PostGIS` fuer persistente Betreiber-, Tarif- und Geo-Daten

### Oeffentliche Auslieferung

- die Public-Version unter `kigenerated.de/netzentgelte` ist ein statischer Snapshot
- Hetzner Shared Hosting bekommt keine zweite Live-Node-Runtime fuer diese App
- das Hosting liefert nur den exportierten Read-Stand aus

## Entwicklung

Die primare Arbeitsumgebung ist jetzt der LXC.

Wichtige Befehle:

```bash
pnpm test
pnpm typecheck
pnpm exec eslint src scripts
NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public
NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build
```

Weitere Projektbefehle:

```bash
pnpm registry:import
pnpm shells:import
pnpm sources:refresh
pnpm sources:audit
```

## Deployment

### LXC

Der Entwicklungs- und Integrationsstand wird nach erfolgreicher Verifikation auf den LXC synchronisiert und dort gebaut/gestartet.

### Hetzner

Der oeffentliche Stand wird ueber einen statischen Public-Snapshot veroeffentlicht.

Wiederverwendbarer Deploy-Pfad:

```bash
bash scripts/public/deploy-public-static.sh
```

Das Script:

- baut den Public-Snapshot
- erzeugt `.deploy-public`
- publiziert nach Hetzner
- prueft danach `https://kigenerated.de/netzentgelte/`

## Projektstruktur

```text
src/
  app/                 Next.js App Router, API routes, page shell
  components/          UI-Komponenten
  modules/             Fachlogik fuer Betreiber, Tarife, Compliance, Sources
  db/                  Schema, DB-Zugriff, Migrationen

data/
  source-registry/     Betreiber-, Shell- und Quellen-Seeds
  geo/                 Geo-Basisdaten und Coverage-Seeds
  compliance/          Regelkataloge

scripts/
  registry/            Registry-Importe und Builder
  sources/             Quellenrefresh und Audits
  public/              Public-Snapshot und Public-Deploy

docs/
  plans/               Design- und Implementierungsdokumente
  runbooks/            operative Runbooks
  coordination/        Batch-/Dispatch-Artefakte
```

## Roadmap

Die naechsten grossen Bausteine sind:

- mehr Betreiber vom Shell-Status in verifizierte oeffentliche Daten heben
- weitere Netzgebiete belastbar polygonisieren
- Endkundenmodell fuer mehr Betreiber vervollstaendigen
- Backfill- und Refresh-Automation weiter haerten
- Deprecated-/Feed-Aenderungen aus quartalsweisen BNetzA-Listen systematisch nachziehen

## Hinweise fuer Maintainer

- der aktive Koordinator ist die Automation `Backfill Koordinator`
- sie arbeitet stündlich gegen den aktuellen Worktree und deployt nach gruener Verifikation auf LXC und Hetzner
- die betrieblichen Details fuer LXC und Hetzner stehen in den Runbooks unter `docs/runbooks/`

## Repository

- GitHub: [meintechblog/Netzentgelte-DE](https://github.com/meintechblog/Netzentgelte-DE)
- aktiver Arbeitsbranch in dieser Phase: `codex/endcustomer-backfill-batch`
