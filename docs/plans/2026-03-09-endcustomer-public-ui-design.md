# Endcustomer Public UI Design

## Goal

Die öffentliche Betreiberansicht soll neben der bestehenden `§14a Modul 3`-Quartalsmatrix auch das vollständige Niederspannungs-Endkundenmodell zeigen, sobald es für einen veröffentlichten Betreiber belastbar in der DB vorliegt.

## Approach Options

### 1. Separate Endcustomer Section

Eine zweite große Tabelle oder ein zusätzlicher Seitenblock nur für `Modul 1/2/3`.

- Vorteil: logisch getrennt
- Nachteil: zwei Wahrheiten pro Betreiber, schlechtere Suche, mehr Scrollhöhe

### 2. Empfohlen: integrierter Produkt-Layer je Betreiber

Die bestehende Betreiberzeile bleibt der zentrale Ort. In der Betreiber-Spalte erscheint ein kompakter `Endkunden · Niederspannung`-Block mit:

- `Modul 1`, `Modul 2`, `Modul 3`
- Messpreise
- kurzen Anforderungs-Badges

- Vorteil: eine Betreiberansicht, eine Suche, kein zweiter Datenblock
- Nachteil: Betreiberzelle wird dichter und braucht saubere Typografie

### 3. Nur API, keine UI

- Vorteil: kein Layout-Umbau
- Nachteil: verfehlt den Produktnutzen

## Recommended Design

Wir nutzen Option 2.

Der bestehende Bereich `Netzbetreiber & Tarifdaten` bleibt erhalten. Pro Betreiber:

- links Betreiber-Meta, Quellen und Reviewstatus
- darunter, falls vorhanden, ein kompakter `Endkunden · Niederspannung`-Block
- darin vier kleine Kacheln:
  - `Modul 1`
  - `Modul 2`
  - `Modul 3`
  - `Messung`

Die Kacheln zeigen nur die verdichteten Kernwerte:

- `Modul 1`: Grundpreis, Arbeitspreis, Reduzierung
- `Modul 2`: Grundpreis, Arbeitspreis
- `Modul 3`: NT/ST/HT sowie knappe Anforderungs-Badges
- `Messung`: Eintarif- und Zweitarifzähler

Die Quartalsmatrix bleibt rechts unverändert die zeitliche Referenz für `Modul 3`. Dadurch entsteht kein zweiter Zeitfenster-Block.

## Data Flow

- `HomePage` lädt zusätzlich den Endkunden-Katalog
- die bestehenden `TariffTableRow`-Daten werden pro Betreiber optional um einen Endkunden-Snapshot ergänzt
- Suche berücksichtigt diese Endkunden-Texte ebenfalls

## Quality Rules

- öffentlich nur für Betreiber mit bereits veröffentlichtem Operator-Eintrag
- kein Fallback auf unvollständige Produkte
- kompakte Darstellung ohne horizontales Overflow
- klare Beschriftung in deutscher Endkundensprache
