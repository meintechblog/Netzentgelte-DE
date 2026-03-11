# Registry-Aware Verified Selector Design

## Problem

Der neue `verified-first`-Koordinator waehlt Kandidaten aktuell nur aus Shell-Metadaten. Dadurch koennen Betreiber als `verification-ready` erscheinen, obwohl der kuratierte Registry-Stand bereits dokumentiert, dass ihre 2026-Modul-3-Daten nur `pending` und strukturell unvollstaendig sind.

Das konkrete Gegenbeispiel ist `egt-energie`:

- die Shell verweist noch auf eine vorlaeufige 2026-Datei
- die offizielle Download-Seite veroeffentlicht inzwischen finale Strom- und Hochlastzeitfenster-PDFs
- der kuratierte Tarifstand bleibt trotzdem `pending`, weil HT/NT laut Preisblatt nur fuer Q1 und Q4 explizit abgerechnet werden und damit keine vollstaendige, widerspruchsfreie Jahrematrix fuer `verified` vorliegt

Der aktuelle Selektor kann diese fachliche Realitaet nicht sehen und lenkt den Koordinator dadurch in Sackgassen.

## Ziel

Die Verify-Lane soll nur noch Betreiber auswaehlen, die realistisch im selben Lauf auf die Homepage gehoben werden koennen.

Erfolgskriterium:

- bekannte `pending`-Registry-Faelle ohne strukturierte, publishable Tarifmatrix werden nicht mehr als `verification-ready` eingestuft
- der Dry-Run des Koordinators waehlt nach dem Fix nicht mehr `egt-energie`
- der Selektor bleibt klein und deterministisch

## Optionen

### Option 1: Nur Shell-Heuristiken haerten

Blockiere nur `vorlaeufig`, `fiktiv` und aehnliche Marker in `notes` oder URLs.

Nachteil:

- behebt nur einzelne offensichtliche Faelle
- erkennt nicht, dass ein finaler offizieller Datensatz trotzdem fachlich `pending` bleiben kann

### Option 2: Shell + Registry-Pending grob mergen

Ziehe den Registry-Reviewstatus hinzu und blockiere alle Slugs, die im Registry-Seed `pending` sind.

Nachteil:

- zu grob
- wuerde auch Kandidaten ausbremsen, die bereits weit genug strukturiert sind und nur noch auf Promotion warten

### Option 3: Registry-aware Verify-Eligibility

Fuehre den Selektor gegen Shells plus Registry-Kontext aus.

Regeln:

- `verified`-Registry-Eintraege sind ohnehin raus
- Slugs ohne Registry-Eintrag duerfen weiter aus Shell-Heuristiken bewertet werden
- Slugs mit Registry-Eintrag gelten nur dann als `verification-ready`, wenn der Registry-Stand bereits strukturierte Tarifdaten enthaelt und die Publishability realistisch ist
- Registry-`pending` ohne `bands` und `timeWindows` oder mit leerem Strukturstand werden auf `evidence-ready` oder `blocked` herabgestuft

Vorteile:

- orientiert sich an der fachlichen Wahrheit, nicht nur am Backfill-Fortschrittslabel
- verhindert Dead-End-Kandidaten wie EGT
- bleibt deutlich kleiner als ein kompletter Orchestrator-Umbau

## Entscheidung

Wir setzen Option 3 um.

## Design

### Datenquelle

Der Selektor bekommt neben `OperatorShell[]` zusaetzlich den kuratierten Registry-Stand aus `getOperatorRegistry()`.

Er baut daraus eine Lookup-Map nach `slug`.

### Eligibility-Regeln

Ein Kandidat ist nur dann `verification-ready`, wenn:

- offizielle Quelle aus der Shell vorliegt
- kein harter Blocker wie `fiktiv` oder `vorlaeufig` greift
- und einer der folgenden Pfade gilt:
  - kein Registry-Eintrag existiert, aber die Shell ist weit genug
  - ein Registry-Eintrag existiert und bringt bereits strukturierte `bands` und `timeWindows` mit, so dass eine Verifikation im selben Lauf realistisch ist

Ein Kandidat wird auf `evidence-ready` oder `blocked` heruntergestuft, wenn:

- der Registry-Eintrag `pending` ist und keine strukturierte Matrix enthaelt
- der Registry-Eintrag nur `summaryFallback` ohne belastbare Tarifstruktur enthaelt
- die Shell auf explizit vorlaeufige Artefakte zeigt

### Koordinator

Das CLI und der Koordinator-Dry-Run nutzen denselben registry-aware Selektor. Der Dry-Run ist damit wieder eine belastbare Vorschau auf den naechsten echten Homepage-Kandidaten.

### Tests

Neue oder angepasste Tests muessen zeigen:

- `egt-energie` wird wegen bekanntem `pending`-Registry-Stand nicht mehr als `verification-ready` ausgewaehlt
- ein Shell-Kandidat ohne Registry-Eintrag kann weiterhin `verification-ready` sein
- ein Registry-Kandidat mit strukturierter Matrix bleibt waehlbar
- der Koordinator-Dry-Run waehlt nach dem Fix nicht mehr `egt-energie`

## Risiken

- Wenn die Registry-Eligibility zu streng wird, kann der Selektor echte Kandidaten uebersehen.
- Wenn sie zu locker bleibt, kehren die bisherigen Dead Ends zurueck.

Darum bleibt die erste Version bewusst einfach: leere oder rein fallback-basierte Registry-`pending`-Eintraege sind nicht verify-eligible; strukturierte Registry-Eintraege schon.
