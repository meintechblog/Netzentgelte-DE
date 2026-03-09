# Source Refresh Runbook

## Goal

Neue oder geaenderte Preisinformationen fuer `§14a Modell 3` nachvollziehbar nachziehen, ohne die Herkunft der Daten zu verlieren.

## Core Rule

Kein publizierter Wert ohne gespeicherte Herkunft.

Fuer jeden Betreiber und jeden Preisstand werden mindestens gespeichert:

- Quellseiten-URL
- PDF- oder Datei-URL
- lokaler Speicherpfad oder externer Dateiverweis
- Hash des Artefakts
- Rohwert oder Textausschnitt, aus dem der Wert stammt
- Parser-Status
- Human-Review-Status

## Discovery Sources

Siehe [discovery-sources.json](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/data/source-registry/discovery-sources.json).

Die aktuelle Startreihenfolge ist:

1. Bundesnetzagentur / Marktstammdatenregister fuer die Vollstaendigkeitsliste aller Stromnetzbetreiber.
2. VNBdigital fuer Betreiberprofile und Links auf die Betreiber-Webseiten.
3. Betreiber-Webseiten und PDFs als eigentliche Preisquellen.

Der aktuell kuratierte Start-Slice liegt in:

- [operators.seed.json](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/data/source-registry/operators.seed.json)

Jeder Seed-Eintrag fuehrt bereits:

- `sourcePageUrl`
- `documentUrl`
- `checkedAt`
- `validFrom`
- `reviewStatus`
- manuell kuratierte `NT` / `ST` / `HT`-Werte, falls sicher extrahiert

## Refresh Ablauf

1. Aktuelle Betreiberliste gegen BNetzA/MaStR aktualisieren.
2. Betreiberprofile und Basislinks gegen VNBdigital pruefen.
3. Neue oder geaenderte Dokumentlinks pro Betreiber sammeln.
4. PDF oder Quelldatei herunterladen und mit Hash speichern.
5. Parser gegen das neue Artefakt laufen lassen.
6. Diff gegen letzten Preisstand erzeugen.
7. Werte mit `human_review_status = pending` markieren.
8. Im UI Rohwert, PDF, Quellseite und Vergleich zum letzten Stand pruefen.
9. Nach Sichtpruefung auf `verified` setzen.

## Human In The Loop

Die Weboberflaeche muss fuer jeden Wert mindestens anzeigen:

- Betreiber
- aktueller normalisierter Wert
- Rohwert / Quelltextausschnitt
- PDF- oder Dokumentlink
- Quellseitenlink
- Zeitpunkt des letzten Abrufs
- Review-Status

## Review Decisions

- `pending`: automatisiert erfasst, noch nicht freigegeben
- `verified`: durch Menschen geprueft und plausibel
- `rejected`: Parserfund oder Quelle unplausibel, nicht publizieren

## Audit Trail

Jeder Refresh-Lauf schreibt:

- technische Lauf-ID
- betroffene Quelle
- gespeicherte Artefakte
- erkannte Preisdifferenzen
- Fehler oder Parsing-Warnungen

## Current Gaps

- Automatisierter MaStR-Exportpfad ist noch nicht implementiert.
- VNBdigital-Betreiberprofile sind noch nicht automatisiert erfasst.
- Betreiber-spezifische Parser fuer reale Preisdokumente fehlen noch.
