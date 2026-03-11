# TWS Netz Registry Design

## Ziel
`TWS Netz GmbH` soll in die aktuelle Operator-Registry ueberfuehrt werden, passend zur inzwischen strengeren Seed-Struktur mit `sourceDocuments`, `currentTariff`, expliziten `bands` und expliziten `timeWindows`.

## Primaerquellen
- Betreiberseite `https://www.tws-netz.de/14a` verweist fuer die aktuell geltenden §14a-Netzentgelte auf die offizielle Stromnetz-Seite.
- Betreiberseite `https://www.tws-netz.de/de/Unsere-Netze/Stromnetz/` veroeffentlicht das 2026-Preisblatt `5-132-TWS-Netz-Preisblatt-2026-final.pdf`.
- Das PDF nennt fuer Modul 3 explizit die Arbeitspreise `HT 12,26`, `ST 9,74`, `NT 3,21` ct/kWh sowie die Uhrzeiten `NT 00:00-06:00`, `ST 06:00-17:00` und `22:00-00:00`, `HT 17:00-22:00`.
- Die Quartalszeile markiert `Q1-Q4 2026` durchgaengig mit `Ja`, daher ist eine ganzjaehrige Matrix primaerbelegt.

## Ansatzoptionen
1. `verified` vollstaendig anlegen.
   Empfehlung. Die Primaerquelle traegt die komplette Matrix ohne Ableitungen.
2. `pending` mit Quell-Doku anlegen.
   Zu konservativ, weil die Zeitfenster hier bereits explizit publiziert sind.
3. Nur Shell belassen.
   Nicht sinnvoll, weil belastbare 2026-Evidenz vorliegt.

## Umsetzung
- `tws-netz` als neuen Registry-Eintrag in `operators.seed.json` anlegen.
- `sourceDocuments` und `currentTariff` direkt auf die offizielle Stromnetz-Seite und das 2026-PDF referenzieren.
- `bands` und `timeWindows` fuer Modell `14a-model-3` komplett hinterlegen, mit `Q1-Q4 2026` als Season-Label.
- Zaehl- und Presence-Assertions in Registry-, Import- und Current-Catalog-Tests nachziehen.

## Risiken
- TWS publiziert zwei 2026-PDF-Pfade auf derselben Stromnetz-Seite. Fuer die Registry wird nur der direkte Netznutzungs-PDF-Pfad verwendet, der explizit `Preisblatt zur Netznutzung Strom 01.01.2026 - 31.12.2026` bezeichnet ist.
- Keine stillen Herleitungen fuer Sommer-/Winterlogik noetig; falls sich die Betreiberquelle aendert, muss nur die Quelle aktualisiert werden, nicht die Struktur.
