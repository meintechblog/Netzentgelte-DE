# Endkunden-Tarifmodell Design

## Ziel

Die Plattform soll pro Netzbetreiber nicht nur `§14a Modul 3`-Arbeitspreise zeigen, sondern den für Endkunden tatsächlich relevanten Niederspannungs-Produktzuschnitt speichern: `Modul 1`, `Modul 2`, `Modul 3`, zugehörige Grundpreise, Arbeitspreise, Netzentgeltreduzierungen, Bedingungen und Zeitfenster.

## Problem im aktuellen Modell

Das heutige Schema in [tariffs.ts](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/db/schema/tariffs.ts) ist auf einzelne Preiszeilen ausgelegt. Für `Modul 3` reicht das gerade noch, für Endkundenlogik aber nicht:

- `Modul 1` besteht aus mehreren Komponenten in einem Produkt
- `Modul 2` hat Voraussetzungen wie separate Messung/Marktlokation
- `Modul 3` hat Zeitfenster, Quartalslogik und Abhängigkeit zu `Modul 1`
- zusätzliche Kosten wie Messstellenbetrieb sollten getrennt von Arbeitspreisen bleiben

Mit nur `tariff_versions` lassen sich diese Beziehungen nicht sauber ausdrücken.

## Entscheidung

- `tariff_versions` bleibt als bestehende historische Preiszeilentabelle erhalten.
- Zusätzlich wird ein fachliches Endkundenmodell eingeführt, das Produkte, Komponenten, Anforderungen und Zeitfenster trennt.
- Der erste Slice fokussiert bewusst nur `Niederspannung`, weil das für Endkunden und `§14a` aktuell der relevante öffentliche Scope ist.
- `Stadtwerke Schwäbisch Hall` dient als Referenzbetreiber, weil das Preisblatt alle Kernfälle in einem Dokument abbildet.

## Zielmodell

Neue Tabellen:

- `tariff_products`
  - Produktkopf je Betreiber, Netzebene, Modul und Gültigkeit
- `tariff_components`
  - monetäre Bestandteile wie Grundpreis, Arbeitspreis, Reduzierung, Messpreis
- `tariff_requirements`
  - fachliche Bedingungen und Nutzungsregeln
- `tariff_time_windows`
  - quartals- und bandbezogene Zeitfenster für zeitvariable Modelle

## Fachliche Regeln

### Modul 1

- Niederspannung ohne Leistungsmessung
- Grundpreis
- Arbeitspreis
- pauschale Netzentgeltreduzierung
- Regel: Entgelt darf nicht unter `0,00 EUR` fallen
- Regel: Standardmodul, wenn keine Wahl getroffen wurde

### Modul 2

- Niederspannung ohne Leistungsmessung
- Grundpreis
- Arbeitspreis
- Regel: separate Messung / separate Marktlokation erforderlich

### Modul 3

- Niederspannung ohne Leistungsmessung
- Standard-, Hoch- und Niedrigtarif als getrennte Komponenten
- quartalsbezogene Zeitfenster
- Regel: intelligentes Messsystem erforderlich
- Regel: nur in Verbindung mit `Modul 1`

### Weitere endkundenrelevante Bestandteile

Zusätzlich sinnvoll, aber getrennt von den `§14a`-Produkten:

- Messstellenbetrieb/Messung
  - z. B. Eintarifzähler, Zweitarifzähler

Nicht in denselben Produktpfad:

- KWK-Umlage
- Offshore-Netzumlage
- §19-/Aufschlag für besondere Netznutzung
- Umsatzsteuer
- Konzessionsabgabe

Diese Größen sind eher Referenz- oder bundesweite Zusatzkosten als betreiberspezifische `§14a`-Produkte.

## Schwäbisch-Hall-Referenz

Quelle:
[4NNE_STW-SHA_ab_01.01.2026.pdf](https://stadtwerke-hall.de/fileadmin/files/Downloads/Netzdaten_Strom/4_Netzentgelte/4NNE_STW-SHA_ab_01.01.2026.pdf)

Relevante Niederspannungswerte:

- `Modul 1`
  - Grundpreis `61,00 EUR/a`
  - Arbeitspreis `5,53 ct/kWh`
  - pauschale Netzentgeltreduzierung `108,70 EUR/a`
- `Modul 2`
  - Grundpreis `0,00 EUR/a`
  - Arbeitspreis `2,21 ct/kWh`
- `Modul 3`
  - Standard `5,53 ct/kWh`
  - Hoch `8,14 ct/kWh`
  - Niedrig `1,11 ct/kWh`
  - `Q1`, `Q2`, `Q4`: drei Tarifstufen
  - `Q3`: nur Standardtarif
- Messung
  - Eintarifzähler `9,50 EUR/a`
  - Zweitarifzähler `14,75 EUR/a`

## Öffentliche Produktlogik

- Öffentlich sichtbar bleiben nur `verified` und `publishable` Datensätze.
- Das neue Modell dient zuerst als belastbare interne Fachbasis.
- Die bestehende öffentliche Tarifmatrix kann danach schrittweise vom `Modul-3-only`-View auf das vollständige Niederspannungs-Endkundenmodell umgestellt werden.

## Erster Implementierungsslice

Um Konflikte mit der laufenden Registry-/Backfill-Arbeit zu vermeiden, umfasst der erste Slice nur:

- Schema-Erweiterung
- neue Domain-Typen / Normalisierungsstruktur
- Schwäbisch-Hall-Referenzfixture mit Tests

Noch nicht im ersten Slice:

- Umbau der öffentlichen UI
- flächige Migration aller Betreiberdaten
- vollständige Persistierung aus bestehenden Seeds in die neuen Tabellen
