# Public Provenance Hardening Design

## Goal

Die öffentliche Betreiberansicht soll zwei Dinge hart absichern:

- der Quellen-/Snapshot-Block muss exakt zur dargestellten Tarifquelle gehören
- der Endkunden-Block darf nur erscheinen, wenn ein konsistenter, verifizierter und vollständiger Produktstand vorliegt

## Optionen

### 1. Empfohlen: exakter View-Model-Gate-Layer

Die Source-Details werden nicht mehr grob per `operatorSlug`, sondern präzise per `sourceSlug` an die Tabellenzeile gemerged. Der Endkunden-Block wird in derselben View-Model-Schicht nur dann erzeugt, wenn für einen gemeinsamen `validFrom` ein vollständiger und verifizierter Satz aus `Modul 1`, `Modul 2`, `Modul 3` plus Messpreisen vorliegt.

- Vorteil: klare öffentliche Wahrheit
- Vorteil: Tests können das Verhalten rein auf View-Model-Ebene absichern
- Nachteil: etwas mehr Selektionslogik in der View-Model-Schicht

### 2. Merge weiter in `page.tsx`

- Vorteil: schnell
- Nachteil: die Seite bleibt Logikträger und der Mehrquellenfall ist schwer testbar

### 3. Nur UI-Warnhinweise

- Vorteil: minimal
- Nachteil: löst den Qualitätsfehler nicht

## Empfehlung

Option 1.

## Design

### Source-Provenance

- neuer Helper für Zeilenanreicherung mit Quellenstatus
- Join-Schlüssel ist `sourceSlug`, nicht `operatorSlug`
- wenn kein exakt passender `CurrentSource` existiert, bleiben Snapshot-/Artifact-Felder leer
- die sichtbaren Quelllinks und der expandierte Prüfblock beschreiben damit immer denselben Quellstand

### Endkunden-Gate

- nur `humanReviewStatus === verified`
- Produkte werden nach `validFrom` gruppiert
- ausgewählt wird nur der neueste `validFrom`, der einen vollständigen Satz enthält:
  - `Modul 1` mit Grundpreis, Arbeitspreis, Reduzierung
  - `Modul 2` mit Grundpreis, Arbeitspreis
  - `Modul 3` mit NT/ST/HT
  - Messung mit Ein- und Zweitarifzähler
- wenn kein solcher Satz existiert, gibt es öffentlich keinen Endkunden-Block

### Tests

- Mehrquellenfall: nur die exakt passende Quelle landet in der Zeile
- unvollständiger Endkunden-Satz: kein `Endkunden · Niederspannung`
- unverifizierte Produktversion: kein Endkunden-Block
- Source-Details-Panel zeigt bei Expand die exakten Snapshot-/Hash-Werte
