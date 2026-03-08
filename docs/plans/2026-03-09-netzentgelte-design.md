# Netzentgelte Deutschland Design

## Summary

Dieses Projekt baut eine eigene Datenplattform fuer deutsche Netzbetreiber auf, die `§14a Modell 3`-Netzentgelte automatisiert sammelt, historisiert, geographisch zuordnet und ueber eine oeffentliche Webapp sowie API bereitstellt.

Die erste Produktversion priorisiert eine belastbare Datenbasis. Tabelle, Karte und API greifen auf dieselbe Datenbank zu. Jede publizierte Information muss bis zur Originalquelle rueckverfolgbar bleiben, damit kuenftige Aktualisierungslaufe gezielt und reproduzierbar ausgefuehrt werden koennen.

## Goals

- Alle relevanten Netzbetreiber in Deutschland als eigene Datensaetze fuehren.
- Preisstaende fuer `§14a Modell 3` historisch speichern.
- Quellen mit Abrufzeitpunkt, URL, Dokumenttyp und Parsing-Status dokumentieren.
- Netzgebiete als echte Geometrien speichern und auf einer interaktiven Karte anzeigen.
- Eine oeffentliche API fuer aktuelle und historische Daten bereitstellen.

## Non-Goals For V1

- Vollstaendige Rechtsbewertung oder tarifliche Handlungsempfehlungen.
- Generischer Vergleichsrechner fuer Endkunden.
- Beliebige weitere Entgeltmodelle ausser `§14a Modell 3`.
- Vollautomatische Deutschlandabdeckung ohne manuelle Parserpflege.

## Users And Core Scenarios

- Oeffentliche Nutzer recherchieren Netzbetreiber, Netzgebiet und aktuelle Werte.
- Interne Pflegeprozesse aktualisieren Quellen und kontrollieren Parsing-Ergebnisse.
- Weitere Webprojekte konsumieren aktuelle oder historische Daten ueber die API.

## Architecture

- `Next.js + TypeScript` als Hauptanwendung fuer Web UI und oeffentliche API.
- `Postgres + PostGIS` als System of Record fuer Betreiber, Quellen, Preisstaende und Geometrien.
- Ingestion-Jobs im selben Repository, aber technisch von der Webapp getrennt.
- Parser pro Quellentyp oder Betreiber, damit unterschiedliche Dokumentstrukturen isoliert gepflegt werden koennen.

## Data Model

Die zentrale Struktur besteht aus folgenden Objekten:

- `operators`: Stammdaten der Netzbetreiber.
- `source_catalog`: Quelle pro Betreiber mit URL, Dokumenttyp, Abrufstrategie, Aktualisierungsnotizen und letztem erfolgreichen Lauf.
- `source_snapshots`: heruntergeladene oder referenzierte Quelldateien mit Hash, Funddatum und Parserstatus.
- `tariff_versions`: fachliche Preisstaende mit Gueltigkeitsbereich, Waehrung, Einheit und Normalisierungsstatus.
- `operator_geometries`: PostGIS-Geometrien pro Netzgebiet mit Herkunft und Genauigkeitsgrad.
- `ingest_runs`: technischer Audit-Log fuer spaetere Refresh-Zyklen.

## Update Strategy

Die Plattform wird explizit fuer spaetere Wiederholungslaufe gebaut.

- Jede Quelle erhaelt eine definierte Update-Strategie und Bearbeitungsnotizen.
- Jeder Lauf schreibt `ingest_runs` und `source_snapshots`.
- Unterschiede zwischen neuem und bisherigem Preisstand werden erkennbar gespeichert.
- Dokumentation haelt fest, welche Betreiber vollautomatisch, halbautomatisch oder manuell gepflegt werden.

## UI

- Tabellenansicht mit Suche, Sortierung, Filtern und Quellenhinweis.
- Kartenansicht auf Basis echter Netzgebiets-Polygone.
- Hover zeigt Betreiber, letzten Preisstand, Gueltigkeit und Link zur Detailansicht.
- Detailseite fasst aktuelle Werte, Historie und Quellen zusammen.

## API Boundaries

- `GET /api/operators`
- `GET /api/operators/:slug`
- `GET /api/tariffs/current`
- `GET /api/tariffs/history`
- `GET /api/geo/operators`

Antworten liefern immer Quelle, Gueltigkeitsdaten und Zeitstempel der letzten erfolgreichen Aktualisierung mit.

## Risks

- Quellen liegen wahrscheinlich in heterogenen Formaten vor.
- Exakte Netzgebiete sind moeglicherweise nicht einheitlich verfuegbar.
- Vollstaendige Abdeckung braucht eine Parser-Strategie, die inkrementell erweitert werden kann.
- Oeffentliche API benoetigt Rate-Limits und klares Caching.

## Delivery Strategy

- Zuerst tragfaehiges Datenmodell und Ingestion-Backbone.
- Danach ein vertikaler Slice mit wenigen Betreibern von Quelle bis UI.
- Anschliessend Ausbau der Parser und Geometrieabdeckung.
- Regelmaessige Aktualisierungslaufe werden von Anfang an mitgedacht und dokumentiert.
