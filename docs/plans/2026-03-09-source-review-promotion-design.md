# Source Review Promotion Design

## Goal

Den kuratierten Betreiber-Slice fuer `Avacon Netz` und `MVV Netze` auf den tatsaechlich veroeffentlichten 2026er Quellenstand ziehen, damit Review-Status, PDF-Links und spaetere Refresh-Hinweise nicht mehr auf veralteten `pending`-Annahmen basieren.

## Approaches

### 1. `pending` beibehalten, bis jedes PDF selbst "final" sagt

Sehr konservativ, aber zu ungenau fuer offizielle Betreiberseiten, die ihre endgueltigen Preisblaetter bereits explizit ankündigen. Das haelt die UI kuenstlich im Warnmodus.

### 2. Betreiberseite als primaeren Statusindikator nehmen, PDF-Vorbehalte separat dokumentieren

Empfohlen. Die Seite entscheidet, ob 2026er Preisblaetter als endgueltig oder vorlaeufig veroeffentlicht sind. Regulatorische Anpassungsvorbehalte bleiben als Refresh-Hinweis in den Notizen sichtbar.

### 3. Zusätzlichen Zwischenstatus einfuehren

Nicht sinnvoll fuer diesen Slice. Das Modell kennt heute nur `pending` und `verified`; ein neuer Status wuerde API, UI und DB verbreitern, ohne den Datenbestand kurzfristig besser zu machen.

## Decision

Ansatz 2. `MVV` wird auf die finale 18.12.2025-Quelle umgestellt und `verified`. `Avacon` wird ebenfalls `verified`, weil die offizielle Betreiberseite die endgueltigen 2026er Netzentgelte veroeffentlicht; der verbleibende Hinweis auf moegliche Anpassungen wird als Review- und Refresh-Notiz konserviert.

## Scope

- Seed-Registry fuer `Avacon Netz` und `MVV Netze` aktualisieren
- Discovery-Notizen fuer spaetere Refresh-Runs nachziehen
- Regressionstest fuer die beiden Operatoren ergaenzen

## Verification

- `pnpm vitest run src/modules/operators/registry.test.ts`
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`
