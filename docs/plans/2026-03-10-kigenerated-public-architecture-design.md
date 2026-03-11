# kigenerated.de Public Architecture Design

## Goal

Netzentgelte Deutschland soll stabil unter `kigenerated.de/...` oeffentlich erreichbar sein, ohne das bestehende `prince2-vorbereitung` zu stoeren und ohne gegen die technischen Grenzen des Hetzner-Webhosting-L-Pakets zu laufen.

## Recommended Approach

Wir trennen **Public-Auslieferung** und **Datenplattform** klar:

- `CT128` wird ab sofort die einzige Entwicklungs-, Build-, Backfill- und Refresh-Umgebung.
- Die oeffentliche Seite auf `kigenerated.de` wird als **statische Read-App** betrieben.
- Die statischen Artefakte werden auf dem Webhosting in ein eigenes Verzeichnis unter der bestehenden Domain ausgeliefert.
- Die Betreiberdaten werden auf `CT128` aus der internen Datenbank gelesen und als versionierte JSON-/HTML-Artefakte in den statischen Build eingebettet.

Diese Architektur passt zur Shared-Hosting-Realitaet:

- kein zweiter dauerhafter Node-Prozess unter einem neuen Subpath
- keine Reverse-Proxy-Abhaengigkeit von root-gemanagten Apache-VHosts
- keine Scraper-/Job-Last auf dem Webhosting
- `prince2-vorbereitung` bleibt unangetastet

## URL Strategy

Die oeffentliche Read-App bekommt einen einfachen Pfad unter derselben Domain:

- empfohlen: `https://kigenerated.de/netzentgelte`

Der bisher angedachte Pfad `kigenerated.de/netzentgelte-deutschland` kann spaeter per normalem Redirect auf den neuen Pfad zeigen, sobald die statische Auslieferung stabil ist.

## Runtime Split

### CT128

- Git-Working-Copy unter `/root/netzentgelte-de`
- Drizzle/Postgres/PostGIS
- Parser, Source-Refresh, Compliance, Backfill
- Build-Pipeline fuer die Public-Artefakte

### kigenerated.de Webhosting

- nur statische Dateien unter `/usr/home/bpjwjy/apps/netzentgelte`
- keine Datenbankverbindung
- keine Node-Runtime fuer Netzentgelte notwendig
- einfache Auslieferung ueber Webspace/Verzeichnis

## Application Changes

Die heutige Next.js-App wird in zwei klarere Schichten geteilt:

1. **Curation/Data Layer**
   - bleibt serverseitig auf `CT128`
   - liest DB, Quellen, Snapshots, Compliance
   - erzeugt ein `public snapshot` fuer die Website

2. **Public Read Layer**
   - rendert aus generierten JSON-Dateien
   - bleibt interaktiv im Browser:
     - Deutschlandkarte
     - Suche
     - Tarifmatrix
     - Quellen-/Pruefpfad
   - benoetigt fuer den ersten Livegang keine produktive Runtime-API

## Public Snapshot Contract

Pro Build erzeugen wir einen belastbaren, oeffentlichen Snapshot mit:

- Betreiberstammdaten
- Kartengeometrien und Coverage-Praezision
- aktuelle veroeffentlichte Tarifdaten
- Quartalsmatrix
- Endkundenmodule `1/2/3` fuer verifizierte Betreiber
- Quellenlinks, Dokumentlinks, Reviewstatus
- Compliance-Ergebnis
- Build-Metadaten:
  - `generatedAt`
  - `sourceSnapshotVersion`
  - `operatorCount`

Damit kann die Public-App vollstaendig clientseitig aus einem statischen Datenpaket laufen.

## Publication Gates

Die bisherigen Gates bleiben bestehen:

- nur `verified`
- nur `publishable`
- nur konsistente Quartale/Zeitfenster
- nur vollstaendige Endkundenprodukte fuer die Endkundenansicht

Der statische Snapshot wird ausschliesslich aus diesen freigegebenen Daten gebaut. Unfertige, `pending` oder deprecated Betreiber bleiben intern.

## Deployment Model

### CT128 -> Build

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm export:public` oder aequivalenter statischer Export

### Build Artifact -> Webhosting

- Upload nach `/usr/home/bpjwjy/apps/netzentgelte`
- oeffentlicher Pfad zeigt auf dieses Verzeichnis
- kein Systemd, kein zweiter Public-Port, kein Apache-VHost-Eingriff

### Optional Redirect

- `kigenerated.de/netzentgelte-deutschland` -> `kigenerated.de/netzentgelte`

Das ist mit normaler Webspace-Weiterleitung realistisch und braucht keinen Reverse-Proxy.

## Existing System Impact

- `prince2-vorbereitung` bleibt technisch getrennt
- bestehende Node-Runtime fuer `prince2` bleibt unangetastet
- der fehlgeschlagene Subpath-Proxy fuer `netzentgelte-deutschland` wird nicht weiter als Zielarchitektur verfolgt

## Risks

1. Teile der aktuellen Next.js-App muessen fuer statischen Export von runtime-dynamischen APIs auf Build-Zeit-Daten umgestellt werden.
2. Sehr grosse Datenmengen oder Geometrien koennen den statischen Payload aufblaehen; dafuer brauchen wir Build-Zuschnitte und komprimierte JSON-Artefakte.
3. Wenn spaeter eine oeffentliche Live-API erforderlich wird, braucht diese eine eigene kontrollierbare Laufzeit ausserhalb des Shared Hostings.

## Why This Is The Right Trade-off

Diese Architektur optimiert auf das, was jetzt wirklich zaehlt:

- die Seite wird endlich zuverlaessig oeffentlich erreichbar
- wir vermeiden weiteres Hosting-Gefrickel gegen Paketgrenzen
- die datenintensive Fachlogik bleibt dort, wo wir sie kontrollieren: auf `CT128`
- spaetere Weiterentwicklung bleibt moeglich, ohne den Live-Betrieb auf Shared Hosting zu ueberlasten
