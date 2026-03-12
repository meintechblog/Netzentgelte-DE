# Verified Operator Loop Design

## Problem

Der bisherige Backfill-Koordinator ist batch- und claim-zentriert. Er kann Dispatch, Integration und Pending-Fortschritt steuern, aber er optimiert nicht auf das eigentliche Ziel: pro Lauf einen fehlenden Netzbetreiber mit validen 2026-Modul-3-Daten bis `reviewStatus=verified` in den Hauptkatalog zu bringen. Dadurch entsteht operativer Leerlauf, Wiederholungsarbeit an bekannten Dead Ends und ein Stundenlauf, der nicht direkt auf Homepage-Wachstum einzahlt.

## Zielbild

Der Stundenlauf wird zu einem `verified-operator-loop` mit genau einem Operator pro Run. Ein Lauf soll:

1. den besten aktuell publizierbaren Kandidaten auswählen,
2. ihn entweder end-to-end bis `verified` durchziehen,
3. oder ihn mit belastbarer Begründung dauerhaft als `blocked` aus dem Loop nehmen,
4. und danach erst im nächsten Stundenlauf den nächsten Kandidaten anfassen.

Erfolg wird damit direkt als Delta im Hauptkatalog messbar.

## Optionen

### 1. Alten Batch-Koordinator weiter ausbauen

Vorteile:
- vorhandene Claims-/Dispatch-Dateien bleiben zentral

Nachteile:
- falsche Arbeitseinheit, weil Batches und Claims nicht dem Live-Ziel entsprechen
- bekannte Dead Ends werden erneut gezogen
- schwer nachvollziehbar, warum kein neuer Hauptkatalog-Eintrag entsteht

### 2. Ein Operator pro Lauf mit persistentem Loop-State

Vorteile:
- direkte Optimierung auf Homepage-Zuwachs
- klarer, auditierbarer Status je Betreiber: `completed` oder `blocked`
- stündlicher Betrieb bleibt klein, deterministisch und robust

Nachteile:
- braucht neue State-Dateien und ein neues CLI
- alte Batch-Dateien bleiben zunächst als Altbestand erhalten

### 3. Externe Queue oder DB-gestützte Workflow-Engine

Vorteile:
- später gut skalierbar

Nachteile:
- unnötige Komplexität
- schlechter Fit für das aktuelle statische/dateibasierte Projektmodell

## Entscheidung

Wir nehmen Option 2.

Der bestehende verifizierungsorientierte Selektor bleibt der fachliche Kern. Darüber kommt ein persistenter Loop-State, der pro Betreiber festhält, ob er bereits erfolgreich live gegangen ist oder warum er bewusst aus der Rotation genommen wurde. Die stündliche Automation arbeitet nur noch mit diesem Loop-State und den vorhandenen Quality Gates.

## Verhaltensmodell

### Auswahl

- Kandidatenbasis: aktive, nicht verifizierte, nicht ausgeschlossene Betreiber
- Selektorstufen:
  - `verification-ready`
  - `evidence-ready`
  - `blocked`
  - `queued`
- zusätzliche Loop-Sperren:
  - `completed`: bereits live gebracht, nicht erneut wählen
  - `blocked`: bekannter Dead End, nicht erneut wählen

### Blocker-Policy

Wenn ein Betreiber auf Basis offizieller Quellen aktuell nicht vollständig verifizierbar ist, bleibt er dauerhaft aus dem Loop genommen. Die Begründung wird konkret im Loop-State gespeichert. Ein späterer Retry passiert nur nach bewusster Rücksetzung oder neuer eingepflegter Evidenz.

### Erfolgsweg

Ein erfolgreicher Lauf muss am Ende alle Gates bestehen:

- `pnpm test`
- `pnpm typecheck`
- `pnpm exec eslint src scripts`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`

Danach folgen Commit, Push, Deploy und Live-Checks. Erst dann wird der Betreiber als `completed` markiert.

## Persistente Dateien

- `docs/coordination/verified-operator-loop.json`
- `docs/coordination/verified-operator-loop.md`

Der JSON-Stand ist maschinenlesbar, die Markdown-Datei dient als Handoff-/Audit-Ansicht.

## Technische Bausteine

- `src/modules/operators/verified-operator-loop.ts`
  - Auswahlplan aus Selektor + persistentem State
- `scripts/automation/verified-operator-loop.ts`
  - CLI fuer Dry-Run, Statusupdates und stündliche Auswahl
- `package.json`
  - neue Skripte fuer Dry-Run und Live-Modus
- `$CODEX_HOME/automations/backfill-koordinator/automation.toml`
  - kompletter Austausch des Prompts auf das neue One-operator-Modell

## Teststrategie

- gezielte Unit-Tests fuer:
  - State-Anwendung
  - Auswahlreihenfolge
  - Block-/Completed-Skips
- Paketskript-Test fuer neue CLI-Skripte
- kalte Heavy-Test-Timeouts explizit anheben, damit `main` auch in einem frischen Checkout stabil laeuft

## Erwartetes Ergebnis

Der Stundenlauf rotiert nicht mehr im Kreis. Er waehlt pro Run den naechsten plausibel verifizierbaren Betreiber, bringt ihn entweder wirklich live in den Hauptkatalog oder dokumentiert belastbar, warum er fuer den Automatikpfad vorerst ausfaellt.
