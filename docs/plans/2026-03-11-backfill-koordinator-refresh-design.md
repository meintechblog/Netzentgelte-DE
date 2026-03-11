# Backfill Koordinator Refresh Design

## Ziel

Die bestehende Automation `Backfill Koordinator` soll wieder operativ funktionieren, aber auf der heutigen Projektarchitektur aufsetzen:

- aktiver Arbeitsstand im Worktree `endcustomer-backfill-batch`
- Entwicklung und Runtime auf dem LXC `CT128`
- oeffentliche Auslieferung als statischer Snapshot unter `https://kigenerated.de/netzentgelte/`
- nur verifizierte und integrierte Aenderungen duerfen automatisch auf LXC und Hetzner landen

## Problemstand

Die existierende Automation zeigt noch auf den alten `bootstrap`-Worktree und kennt die folgenden spaeteren Architekturentscheidungen nicht:

- `kigenerated.de` wird nicht mehr ueber eine zweite Node-Runtime beliefert, sondern ueber statische Public-Artefakte
- der produktive Pfad ist `https://kigenerated.de/netzentgelte/`
- neue Import-/Backfill-Ergebnisse muessen nach erfolgreicher Integration sowohl auf den LXC als auch auf Hetzner ausgerollt werden
- vorhandene Bestandsdaten muessen genauso ueberarbeitet werden koennen wie neue Shell-Eintraege

## Empfohlenes Betriebsmodell

Der Koordinator bleibt ein vollautomatischer Orchestrator, aber mit klaren Release-Gates:

1. Dispatch
   - `shell-batches` und `backfill-briefing` lesen
   - nur freie Slots neu belegen
   - Worker nur dann als aktiv markieren, wenn Worktree, Briefing und Health-Check erfolgreich sind

2. Integrate
   - fertig gemeldete Worker-Ergebnisse aufnehmen
   - nur reproduzierbare Registry-/Backfill-Aenderungen integrieren
   - Bestandskorrekturen und neue Betreiber gleich behandeln

3. Gate
   - Projektverifikation auf dem aktuellen Worktree
   - zusaetzlich statischen Public-Snapshot pruefen
   - Deploy nur bei gruenem Gate und echten integrierten Aenderungen

4. Deploy
   - Git commit und Push
   - LXC synchronisieren, bauen und starten
   - Public-Snapshot bauen und auf Hetzner nach `kigenerated.de/netzentgelte/` ausrollen

5. Report
   - Kurzprotokoll in Automation-Memory
   - bei Fehlern konsistente Blocker statt halb integrierter Zustaende

## Sicherheitsregeln

- Keine Automation darf auf dem alten `bootstrap`-Worktree laufen.
- Kein GitHub-Push ohne gruene Verifikation.
- Kein Hetzner-Publish ohne erfolgreichen Public-Snapshot-Build.
- Lint darf nicht durch `.deploy-public` oder andere Build-Artefakte kippen.
- Neue Betreiber und Bestandskorrekturen folgen denselben Verifikationsregeln.
- Bei SSH-/Netzwerkfehlern wird der Lauf als Infrastrukturblocker behandelt, nicht als Datenqualitaetsfehler.

## Operativer Test

Vor Reaktivierung der stündlichen Automation muss ein kompletter manueller Testlauf durchgefuehrt werden:

- Automation-Workflow lokal/koordiniert gegen den aktuellen Worktree ausfuehren
- LXC-Deploy pruefen
- Hetzner-Publish pruefen
- `https://kigenerated.de/netzentgelte/` gegen die aktualisierte Snapshot-Version verifizieren

Erst danach wird die Automation wieder auf `ACTIVE` mit stündlichem Rhythmus gesetzt.

## Doku-Folge

Die Hetzner-/LXC-Deployschritte muessen als wiederverwendbare Runbook- und Script-Basis festgehalten werden, damit kuenftige `kigenerated.de/<projektname>/`-Deployments schneller reproduzierbar bleiben.
