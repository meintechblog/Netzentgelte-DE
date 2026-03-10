# Netzbetreiber Filling Runbook

## Goal

Netzbetreiber-Eintraege in der Registry nur mit belastbarer offizieller Evidenz erweitern oder auf `verified` anheben.

Die uebergeordnete Arbeitsordnung dafuer steht in:

- [operator-curation-model.md](/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/operator-curation-model.md)

## Primary Reference

Die wiederverwendbare globale Arbeitsregel liegt in:

- [`~/.codex/skills/netzbetreiber-registry-filling/SKILL.md`](/Users/hulki/.codex/skills/netzbetreiber-registry-filling/SKILL.md)

Diese Skill ist die Default-Referenz fuer kuenftiges Filling. Das Konzept wird bewusst iterativ verbessert, sobald neue Quellenmuster, Ambiguitaeten oder bessere Guardrails auftauchen.

Bei technisch blockierten offiziellen Quellen zusaetzlich verwenden:

- [`~/.codex/skills/official-source-access-validation/SKILL.md`](/Users/hulki/.codex/skills/official-source-access-validation/SKILL.md)

## Project Scope

Im Projekt betrifft das Filling vor allem:

- [`operators.seed.json`](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/data/source-registry/operators.seed.json)
- [`registry.test.ts`](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/registry.test.ts)
- [`registry-import.test.ts`](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/registry-import.test.ts)
- [`route.test.ts`](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/api/operators/route.test.ts)
- [`route.test.ts`](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/api/tariffs/current/route.test.ts)

## Local Rules

- Bestands-Sanierung hat Prioritaet vor reinem Neufill.
- Bereits vorhandene Betreiber duerfen aktiv korrigiert, erweitert und vervollstaendigt werden; sie sind nicht "fertig", nur weil schon ein Eintrag existiert.
- Nur offizielle Betreiberseiten und offizielle Artefakte als tariff truth verwenden.
- Discovery-Quellen wie MaStR oder VNBdigital nur fuer Vollstaendigkeit und Linkfindung nutzen.
- `verified` nur setzen, wenn `validFrom`, `NT`, `ST`, `HT` und die benoetigten Zeitfenster direkt aus der Quelle belegbar sind.
- Bei Restunsicherheit `pending` belassen und die Luecke in `notes` oder `summaryFallback` dokumentieren.
- `dayLabel` und Saisonlogik konservativ formulieren; nichts hineindeuten, was die Quelle nicht selbst sagt.
- Anti-Bot- oder Cloudflare-Sperren sind kein stilles `verified`: wenn die offizielle Primaerquelle im Automationslauf nicht abrufbar ist, bleibt der Datensatz `pending`, bis ein belastbarer offizieller Snapshot oder ein manuell verifizierter Beleg vorliegt.
- Quellen, die nur HT/NT fuer `Q1/Q4` nennen, reichen nicht fuer eine Sommer- oder Volljahres-Promotion. Ohne explizite `Q2/Q3`-Logik oder klaren Komplement-Beleg bleibt der Datensatz `pending`.
- Wenn ein `pending`-Datensatz nur Teilquartale, unklare ST-Labels oder access-blockierte Primaerquellen hat, werden strukturierte `bands` und `timeWindows` aus dem Seed entfernt und durch einen dokumentierten `summaryFallback` ersetzt.
- Projektregeln wie `lueckenlose Quartalsmatrix`, `korrekte Mitternachts-Splits` oder `Mindestdauer pro explizitem Tarifslot` muessen explizit dokumentiert sein, bevor sie fuer Promotion oder Rework verwendet werden.

## Priority Order

Die Reihenfolge fuer operative Arbeit ist:

1. bestehende Audit-Faelle aus `structure-audit` und `endcustomer audit`
2. bestehende Shells mit vorhandener Quelle
3. neue Betreiber aus `registry-review`
4. generische Discovery
5. deprecated/disappearance review

## Current Learnings

- `Avacon Netz` darf promoted werden, wenn die offizielle Betreiberseite die 2026-Datei explizit als endgueltig fuehrt und das offizielle sVE-Preisblatt die Quartalsmatrix Q1-Q4 vollstaendig ausweist.
- `NORDNetz` darf promoted werden, wenn die kanonische 2026-Seite auf das finale Strom-PDF zeigt und das Modul-3-Preisblatt die Q1/Q4-Zeitfenster plus Q2/Q3-Standardtarif direkt nennt.
- `SWE Netz` ist trotz finalem 2026-PDF weiter `pending`, weil nur HT- und NT-Zeiten fuer `Q1/Q4` explizit ausgewiesen sind; ST- und `Q2/Q3`-Logik fehlen als publizierbarer Beleg.
- `Syna` ist ein eigener Sonderfall: die offiziellen 2026-Pfade liegen auf `syna.de`, laufen im Automationskontext aber in eine Cloudflare-Challenge. Ohne primaerquellenfaehigen Abruf oder manuell dokumentierten Snapshot wird hier nicht promoted.
- `Heidelberg Netze` bleibt `pending`, wenn das offizielle Preisblatt Modul 3 nur fuer einzelne Quartale wie `Q3 und Q4` ausweist und selbst auf eine quartalsweise Begrenzung hinweist.
- `SWM Infrastruktur`, `EWR Netz`, `GeraNetz` und `e-netz Suedhessen` bleiben trotz lesbarer 2026-PDFs source-only `pending`, wenn die Quelle nur Winter- oder Teilquartale ausweist oder die ST-Logik nicht als publizierbare Jahresmatrix belegt; solche Datensaetze werden nicht mehr mit halber Struktur in den Import gegeben.

## Verification

Nach jeder relevanten Filling-Aenderung mindestens ausfuehren:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/registry-import.test.ts src/app/api/operators/route.test.ts src/app/api/tariffs/current/route.test.ts
```

## Iterative Improvement Rule

Wenn ein neuer Betreiberfall eine Regel aufdeckt, die in der Skill oder im Runbook noch fehlt:

1. Die neue Erkenntnis in der globalen Skill nachziehen.
2. Falls projektrelevant, den Verweis oder die Projektregel hier im Runbook aktualisieren.
3. Erst danach das naechste Filling auf derselben Basis fortsetzen.

So wird das Filling-Konzept mit jeder Runde belastbarer, statt dieselben Entscheidungen immer wieder ad hoc neu zu treffen.
