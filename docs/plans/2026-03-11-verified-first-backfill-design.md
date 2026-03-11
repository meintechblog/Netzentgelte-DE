# Verified-First Backfill Design

**Date:** 2026-03-11

## Goal

Der Backfill soll nicht mehr auf `source-found` oder `public pending` optimiert werden, sondern auf genau ein Ergebnis: ein Betreiber wird pro erfolgreichem Lauf vollstaendig verifiziert und erscheint danach auf der Startseite unter `https://kigenerated.de/netzentgelte/`.

## Problem

Der aktuelle Workflow verteilt die Arbeit auf mehrere Zwischenstufen:

- `candidate`
- `source-found`
- `public pending`
- `verified + publishable`

Das fuehrt zu sichtbarer Aktivitaet auf der Pending-Seite, aber nicht zu Wachstum im Hauptkatalog. Die operative Erfolgsmetrik ist dadurch falsch: ein Lauf kann als erfolgreich erscheinen, obwohl die Startseite unveraendert bleibt.

## Chosen Approach

Wir ersetzen den batch-orientierten Pending-Funnel als Hauptpfad durch ein `verified-first`-Betriebsmodell:

1. Ein Lauf arbeitet standardmaessig genau einen Betreiber.
2. Erfolg zaehlt nur, wenn dieser Betreiber alle Public-Gates besteht.
3. Source-Hunting, blocked cases und schwache Evidenz bleiben Nebenpfade und duerfen den Hauptfluss nicht verwässern.

## Design

### 1. Neue Erfolgsmetrik

Der Backfill wird auf `homepage_count +1` optimiert. Ein Lauf ist nur dann erfolgreich, wenn:

- ein Betreiber `reviewStatus = verified` erreicht,
- der Betreiber durch `filterPublishableOperators(...)` in den public snapshot faellt,
- Export, Build und Deploy erfolgreich sind,
- und der Betreiber anschliessend live im Hauptsnapshot bzw. auf der Startseite sichtbar ist.

Alles andere ist Zwischenzustand, nicht Ziel.

### 2. Reduziertes Zustandsmodell

Der operative Workflow wird auf vier Stufen reduziert:

- `queued`: Kandidat bekannt, aber noch nicht priorisiert
- `evidence-ready`: offizielle Seite und offizielles 2026-Dokument bestaetigt
- `verification-ready`: Dokument ist so lesbar, dass NT/ST/HT, Zeitfenster, Quotes und `validFrom` vollstaendig extrahierbar sind
- `verified-live`: Public-Gates bestanden und erfolgreich deployed

`public pending` bleibt als Diagnose- bzw. Transparenzansicht erlaubt, ist aber nicht mehr der Default-Erfolgspfad.

### 3. Kandidatenauswahl statt Batch-Abtrag

Die bisherige Batch-/Claims-/Koordinator-Logik wird fuer den Kernfluss entwertet. Der neue Lauf arbeitet nach `pick-best-operator-for-verification`:

1. Alle nicht-verifizierten Kandidaten laden.
2. Kandidaten mit harten Ausschlusskriterien sofort ausfiltern:
   - `fiktiv`
   - kein offizielles 2026-PDF
   - unklare Quartalslogik
   - nur Teilbelege
   - access-blocked ohne belastbaren Artefaktbeleg
3. Die verbleibenden Kandidaten nach Abschlusswahrscheinlichkeit sortieren.
4. Nur den besten Kandidaten in diesem Lauf bearbeiten.

Damit wird aus Backfill-Parallelismus ein Abschluss-Serialismus.

### 4. Zwei operative Lanes

Der Workflow trennt kuenftig klar zwischen:

- `verification lane`: Betreiber, die in einem Lauf realistisch bis `verified-live` gebracht werden koennen
- `blocked evidence lane`: Betreiber mit offiziellen, aber unzureichenden oder widerspruechlichen Quellen

Der erste Lane ist produktiv. Der zweite Lane dient nur zur Dokumentation und Priorisierung fuer spaetere manuelle oder parser-spezifische Arbeit.

### 5. Verified-by-Construction statt Pending-by-Default

Der zentrale Umbau ist fachlich:

- nicht mehr zuerst Shells oeffentlich aufblasen
- sondern nur noch Kandidaten in den Hauptlauf ziehen, die `verified` realistisch erreichen koennen

Das bedeutet:

- `source-found` allein reicht nicht fuer den Hauptlauf
- `evidence-ready` ist die minimale Eintrittskarte
- `verification-ready` ist die letzte Vorstufe vor echter Registry-Anreicherung

### 6. Neue technische Bausteine

Der Umbau soll auf drei kleine, testbare Bausteine hinauslaufen:

- `verified-candidate-selector`
  - waehlt nur Kandidaten mit realistischer Vollverifikation aus
- `operator-verification-workflow`
  - fuehrt einen Operator von offizieller Evidenz bis zu vollstaendigen strukturierten Tarifdaten
- `publish-verification-gate`
  - bestaetigt nach Export/Deploy, dass der Betreiber im Hauptsnapshot sichtbar ist

Der bisherige Koordinator darf diese Bausteine spaeter orchestrieren, ist aber nicht mehr der Kern des Fachmodells.

### 7. Definition of Done pro Betreiber

Ein Betreiber gilt erst dann als abgeschlossen, wenn alle Punkte erfuellt sind:

- offizielle Quellseite und offizielles 2026-Dokument bestaetigt
- `validFrom` explizit
- `NT`, `ST`, `HT` als strukturierte Werte vorhanden
- Zeitfenster vollstaendig und widerspruchsfrei
- `sourceQuote` fuer Bandwerte und Zeitfenster vorhanden
- `reviewStatus = verified`
- Integrity-Checks bestehen
- Betreiber erscheint im public snapshot
- Betreiber erscheint live auf der Startseite

### 8. Operative Beweisfuehrung

Der Umbau ist erst dann akzeptiert, wenn er mindestens einen heute noch nicht sichtbaren Betreiber im selben Umbau-Strang bis `verified-live` bringt. Das Design ist damit absichtlich nicht nur organisatorisch, sondern muss sich an einem echten `73 -> 74` oder hoeher beweisen.

## Rejected Alternatives

### Weiter mit `pending` als Hauptfortschritt

Nicht gewaehlt, weil diese Metrik bereits sichtbar am Nutzerziel vorbeilaeuft.

### Vollautomatischer Multi-Operator-Crawler

Nicht gewaehlt, weil er den Engpass verschiebt. Das Problem ist nicht fehlender Crawl, sondern fehlender Abschluss.

### Batches beibehalten und nur anders priorisieren

Nicht gewaehlt, weil der Batch-Fokus weiterhin die Aufmerksamkeit von `verified-live` auf Zwischenstufen lenkt.

## Verification

Die Umsetzung ist nur gueltig, wenn sie diese Nachweise liefert:

- Tests fuer Selector, Workflow und Publish-Gate
- mindestens ein realer Betreiber wird auf `verified` gehoben
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`
- Deploy auf `kigenerated.de/netzentgelte`
- Live-Check, dass der neue Betreiber im Hauptkatalog erscheint
