# Endcustomer Backfill Batch Design

## Ziel

Die veroeffentlichten Betreiber ohne Endkundenmodell fuer `Niederspannung` sollen systematisch um `Modul 1`, `Modul 2`, `Modul 3` und Messpreise ergaenzt werden. Die Referenzlogik bleibt dieselbe wie bei `Stadtwerke Schwaebisch Hall`: nur offizielle 2026er Primaerquellen, keine Ableitungen aus aehnlichen Betreibern.

## Entscheidung

- Start mit `AllgaeuNetz GmbH & Co. KG` als erster fehlender Referenzfall.
- Danach weiterer Backfill in Betreiber-Batches direkt aus dem Live-Audit.
- Jede Ergaenzung landet in `endcustomer-reference.ts`, damit Import, Audit, API und UI denselben kuratierten Stand verwenden.
- Unklare oder nicht explizit dokumentierte Faelle bleiben offen und werden nicht geraten.

## Datenregeln

- `Modul 1`: Grundpreis, Arbeitspreis, Netzentgeltreduzierung
- `Modul 2`: Grundpreis, Arbeitspreis
- `Modul 3`: Standard-, Hoch- und Niedrigtarif plus Quartals-/Zeitfensterlogik
- `Messung`: Eintarif- und Zweitarifpreise, wenn das Preisblatt sie fuer Niederspannung ausweist
- Anforderungen bleiben auf dem bestehenden Default-Modell, solange das Preisblatt nichts abweichendes vorgibt

## Verifikation

- Neue Referenzen werden durch Tests in `endcustomer-reference.test.ts` abgesichert.
- Der Audit-Endpunkt muss fehlende Betreiberzahlen entsprechend reduzieren.
- Keine Betreiber-Ergaenzung ohne offiziellen PDF-/Quellbeleg.
