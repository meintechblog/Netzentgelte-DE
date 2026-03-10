# Modul-3 Compliance Design

**Datum:** 2026-03-10

## Ziel

Die Webapp soll sichtbar machen, welche Netzbetreiber die aus der BDEW-Anwendungshilfe fuer Modul 3 ableitbaren Regeln einhalten oder verletzen. Nutzer sollen Betreiber gezielt nach Regelkonformitaet filtern koennen und pro Betreiber klar sehen, welche Regel verletzt ist. Die Regelbasis muss generisch aufgebaut sein, damit neue oder geaenderte Vorgaben spaeter ohne UI-Umbau eingespielt werden koennen.

## Quelle

- Referenzdokument: [BDEW Anwendungshilfe Modul 3, Version 1.1](https://www.bdew.de/media/documents/BDEW-AWH_Modul_3_V1.1_Korrektur070225.pdf)

## Produktentscheidung

Wir fuehren keinen einmalig hart codierten Modul-3-Sonderfall ein, sondern einen regelkatalogbasierten Compliance-Pfad:

1. Ein strukturiertes Regelset beschreibt Quelle, Geltungsbereich, maschinenpruefbare Bedingung und Parameter.
2. Ein generischer Evaluator prueft veroeffentlichte Betreiberdaten gegen dieses Regelset.
3. Die UI zeigt den Gesamtstatus, konkrete Verstosse und den verlinkten Regelkatalog.
4. Der Such- und Filterbereich kann Betreiber mit Verstoessen gezielt anzeigen.

Nicht belastbar automatisch pruefbare Aussagen werden nicht als Verstoss dargestellt, sondern als `nicht bewertbar`.

## Erste Regelmenge

Die erste Version bewertet nur Regeln, die aus dem PDF direkt und mit den vorhandenen Betreiberdaten maschinell pruefbar sind:

1. `ht_min_2h_per_day`
   - HT muss mindestens 2 Stunden pro Tag dauern.
2. `ht_max_100_percent_above_st`
   - HT darf maximal 100 Prozent ueber ST liegen.
3. `nt_between_10_and_40_percent_of_st`
   - NT muss zwischen 10 Prozent und 40 Prozent des ST liegen.
4. `at_least_two_quarters_active`
   - Die Zeitfenster und Preisstufen fuer HT und NT muessen in mindestens 2 Quartalen abgerechnet werden.
5. `same_time_windows_across_quarters`
   - Preisstufen und Zeitfenster duerfen zwischen Quartalen nicht variieren.

## Datenmodell

Neue Domainen:

- `ComplianceRuleSet`
  - `ruleSetId`
  - `title`
  - `version`
  - `sourceDocumentUrl`
  - `sourceDocumentLabel`
  - `effectiveFrom`
  - `rules[]`

- `ComplianceRule`
  - `ruleId`
  - `title`
  - `description`
  - `scope`
  - `severity`
  - `sourceCitation`
  - `checkType`
  - `parameters`

- `ComplianceEvaluation`
  - `ruleSetId`
  - `status`: `compliant | violation | not-evaluable`
  - `violations[]`
  - `passes[]`
  - `notEvaluated[]`

Die Regeldefinition liegt als dateibasierter Katalog im Projekt, damit sie transparent versioniert und leicht aktualisierbar bleibt.

## Evaluierungslogik

Der Evaluator arbeitet auf dem bereits publizierten Betreiberdatensatz, nicht auf rohen PDF-Fragmenten. Dadurch bleiben UI, API und Filter konsistent.

Pruefprinzip:

- Quartalsmatrix und Zeitfenster aus vorhandenen Betreiberdaten nutzen.
- Jede Regel bekommt einen eigenen generischen Check-Handler.
- Ergebnisse werden als strukturierte Finding-Objekte zurueckgegeben.
- Bei fehlender Datengrundlage wird die Regel als `not-evaluable` markiert.

Beispiel fuer einen Verstoss:

- `ruleId`: `ht_min_2h_per_day`
- `status`: `violation`
- `message`: `HT-Zeitfenster 18:00-18:30 unterschreitet die Mindestdauer von 2 Stunden.`

## UI

Die Seite bekommt drei neue Bausteine:

1. Einen kompakten Regeln-Infoblock mit:
   - Titel des aktiven Regelsets
   - Link auf das BDEW-PDF
   - strukturierte Liste der aktiven Regeln

2. Einen Compliance-Filter im Betreiberbereich:
   - Alle
   - Regelkonform
   - Mit Verstoessen
   - Nicht bewertbar

3. Einen Betreiber-Compliance-Block je Eintrag:
   - Gesamtstatus
   - verletzte Regeln
   - optional bestandene Regeln und nicht bewertbare Regeln eingeklappt

Der bestehende seitenweite Suchfilter muss die neuen Regeltexte ebenfalls durchsuchen koennen.

## API und View-Model

Die Compliance-Daten sollen durchgaengig durch den bestehenden Datenpfad transportiert werden:

- `current-catalog`
- Serializer
- View-Model
- `TariffTable`
- `OperatorExplorer`

Optional kann spaeter ein dedizierter API-Endpunkt fuer Regelsets oder Compliance-Audit hinzukommen. Fuer die erste Version reicht es, die Daten in die bestehende Betreiberansicht zu integrieren.

## Fehler- und Randfaelle

- Betreiber ohne vollstaendige Modul-3-Zeitfenster koennen einzelne Regeln nicht bewerten.
- Assumptions wie `assumed-st` duerfen nicht als offizieller Nachweis missverstanden werden.
- Die Evaluierung muss auf gespeicherten Netto-Werten arbeiten, nicht auf eventuell brutto eingelesenen Rohwerten.
- Umlaute in sichtbaren Texten immer echt ausgeben.

## Tests

Wir decken drei Ebenen ab:

1. Regelkatalog- und Evaluator-Unit-Tests
2. View-Model- und API-Tests fuer das neue Compliance-Payload
3. UI-Tests fuer Filter, Regelanzeige und Betreiber-Findings

## Nicht Teil dieser Runde

- automatische Extraktion neuer Regeln direkt aus PDFs
- wirtschaftliche Plausibilisierung der H0-Indifferenz-Nebenbedingung
- historische Regelversionen mit Rueckrechnung alter Betreiberstaende
