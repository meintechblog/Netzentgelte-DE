# Backfill Ready 013 Design

**Date:** 2026-03-11

## Goal

`backfill-ready-013` soll nicht manuell-chaotisch abgearbeitet werden, sondern ueber einen kleinen, testbaren Batch-Workset-Schritt, der die 25 Shells in einen reproduzierbaren Arbeitszustand bringt und damit auch die naechsten Backfill-Batches beschleunigt.

## Chosen Approach

Wir priorisieren den inhaltlichen Fortschritt vor einem grossen Vollautomaten:

1. `backfill-ready-013` bleibt der erste fachliche Arbeitsblock.
2. Wir bauen nur die kleinste zusaetzliche Automation, die diesen Batch und Folge-Batches spuerbar hilft.
3. Die Registry bleibt konservativ: offizielle Seiten und Dokumente zuerst, `pending` vor `verified`, keine inferierten Tarifwerte.

## Design

### 1. Batch Workset statt grossem Crawler

Statt sofort einen vollautomatischen End-to-End-Crawler fuer alle Betreiber zu bauen, fuehren wir einen kleinen Batch-Workset-Schritt ein. Dieser Schritt nimmt einen Backfill-Batch und erzeugt daraus eine deterministische Arbeitsliste mit den Shells, ihren kanonischen URLs, Hostnamen und dem aktuellen Bearbeitungsstatus.

Damit bekommen wir:

- einen stabilen Einstiegspunkt fuer `backfill-ready-013`
- weniger ad-hoc Shell-Inspection
- wiederverwendbare Batch-Logik fuer `014`, `015`, ...

### 2. Fokus auf offizielle Quellenfindung

Die erste Ausbaustufe automatisiert nicht die komplette Tarifextraktion, sondern das strukturierte Vorbereiten von evidenzfaehiger Backfill-Arbeit:

- welche Betreiber gehoeren in den Batch
- welche offizielle Startseite ist aktuell hinterlegt
- welche Hostnamen muessen priorisiert werden
- welche Shells stehen noch auf `candidate` oder `missing`

Auf dieser Basis koennen wir die Batch-Shells schneller auf `source-found` oder belastbares `pending` heben, ohne Tarifdaten zu raten.

### 3. Batch 013 als Referenzlauf

`backfill-ready-013` ist der Referenzlauf fuer diese kleinere Automationsstufe. Erfolg bedeutet:

- der Batch ist als maschinenlesbarer Workset auswertbar
- mindestens ein Teil der 25 Shells wird sauber angereichert
- die dafuer gebaute Logik ist nicht batch-spezifisch, sondern fuer weitere `backfill-ready-*`-Batches wiederverwendbar

## Rejected Alternatives

### Vollautomat zuerst

Nicht gewaehlt, weil die Betreiberquellen zu heterogen sind und wir sonst weiter Koordinator-Logik bauen, ohne inhaltlich die Registry voranzubringen.

### Nur Batch 013 manuell

Nicht gewaehlt, weil wir damit denselben Aufwand in `014` und `015` wiederholen wuerden und der stuedliche Betrieb fachlich kaum skaliert.

## Verification

Die Umsetzung muss ueber TDD abgesichert werden:

- failing Tests fuer den neuen Batch-Workset-Schritt
- gezielte Verifikation der `013`-Selektion
- bestehende Koordinator-/Batch-Tests bleiben gruen
