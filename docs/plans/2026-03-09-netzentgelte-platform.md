# Netzentgelte Deutschland Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eine oeffentliche Webapp plus API aufbauen, die `§14a Modell 3`-Netzentgelte fuer deutsche Netzbetreiber automatisiert sammelt, historisiert und geographisch darstellt.

**Architecture:** Ein einzelnes Repository enthaelt eine `Next.js`-Anwendung fuer UI und API sowie Ingestion-Skripte fuer Quellenkatalog, Snapshots, Parser und Geometrien. `Postgres` mit `PostGIS` speichert fachliche Daten, technische Laufhistorie und Kartenpolygone.

**Tech Stack:** `Next.js`, `TypeScript`, `pnpm`, `Drizzle ORM`, `PostgreSQL`, `PostGIS`, `Vitest`, `Playwright`, `MapLibre GL JS`, `zod`, `tsx`

---

### Task 1: Workspace Bootstrap

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/lib/env.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Test: `src/app/page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("renders project shell", () => {
  render(<HomePage />);
  expect(screen.getByText("Netzentgelte Deutschland")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest src/app/page.test.tsx`
Expected: FAIL because project config and page do not exist yet.

**Step 3: Write minimal implementation**

```tsx
export default function HomePage() {
  return <main>Netzentgelte Deutschland</main>;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest src/app/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "chore: bootstrap netzentgelte workspace"
```

### Task 2: Database And PostGIS Foundation

**Files:**
- Create: `docker-compose.yml`
- Create: `drizzle.config.ts`
- Create: `src/db/schema/operators.ts`
- Create: `src/db/schema/sources.ts`
- Create: `src/db/schema/tariffs.ts`
- Create: `src/db/schema/geometries.ts`
- Create: `src/db/client.ts`
- Create: `drizzle/0000_initial.sql`
- Test: `src/db/schema/schema.test.ts`

**Step 1: Write the failing test**

```ts
import { tables } from "./schema-index";

test("registers required core tables", () => {
  expect(tables).toEqual(
    expect.arrayContaining([
      "operators",
      "source_catalog",
      "source_snapshots",
      "tariff_versions",
      "operator_geometries",
      "ingest_runs",
    ]),
  );
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest src/db/schema/schema.test.ts`
Expected: FAIL because schema exports are missing.

**Step 3: Write minimal implementation**

```ts
export const tables = [
  "operators",
  "source_catalog",
  "source_snapshots",
  "tariff_versions",
  "operator_geometries",
  "ingest_runs",
];
```

Add SQL migration that enables:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest src/db/schema/schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add initial postgres and postgis schema"
```

### Task 3: Source Catalog And Audit Trail

**Files:**
- Create: `src/modules/sources/source-catalog.ts`
- Create: `src/modules/sources/source-catalog.test.ts`
- Create: `src/db/schema/ingest-runs.ts`
- Modify: `src/db/schema/sources.ts`
- Modify: `src/db/schema/tariffs.ts`

**Step 1: Write the failing test**

```ts
import { buildSourceRecord } from "./source-catalog";

test("creates a source record with refresh metadata", () => {
  expect(
    buildSourceRecord({
      operatorSlug: "demo-netz",
      sourceUrl: "https://example.com/preise.pdf",
      updateStrategy: "quarterly-review",
    }),
  ).toMatchObject({
    operatorSlug: "demo-netz",
    sourceUrl: "https://example.com/preise.pdf",
    updateStrategy: "quarterly-review",
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest src/modules/sources/source-catalog.test.ts`
Expected: FAIL because the builder does not exist.

**Step 3: Write minimal implementation**

```ts
export function buildSourceRecord(input: {
  operatorSlug: string;
  sourceUrl: string;
  updateStrategy: string;
}) {
  return {
    ...input,
    parserMode: "pending",
    reviewStatus: "unverified",
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest src/modules/sources/source-catalog.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add source catalog metadata model"
```

### Task 4: Ingestion Runner And First Operator Adapter

**Files:**
- Create: `scripts/ingest/run-ingest.ts`
- Create: `src/modules/ingest/runner.ts`
- Create: `src/modules/ingest/contracts.ts`
- Create: `src/modules/operators/demo-operator.adapter.ts`
- Create: `src/modules/ingest/runner.test.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

```ts
import { runIngest } from "./runner";

test("executes adapter and returns normalized tariff payload", async () => {
  const result = await runIngest("demo-operator");
  expect(result.operatorSlug).toBe("demo-operator");
  expect(result.tariffs.length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest src/modules/ingest/runner.test.ts`
Expected: FAIL because runner and adapter registry are missing.

**Step 3: Write minimal implementation**

```ts
export async function runIngest(operatorSlug: string) {
  return {
    operatorSlug,
    tariffs: [
      {
        modelKey: "14a-model-3",
        valueCentsPerKwh: "12.34",
      },
    ],
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest src/modules/ingest/runner.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add first ingestion runner slice"
```

### Task 5: Public API For Current And Historical Tariffs

**Files:**
- Create: `src/app/api/operators/route.ts`
- Create: `src/app/api/tariffs/current/route.ts`
- Create: `src/app/api/tariffs/history/route.ts`
- Create: `src/app/api/geo/operators/route.ts`
- Create: `src/app/api/tariffs/current/route.test.ts`
- Create: `src/lib/api/serializers.ts`

**Step 1: Write the failing test**

```ts
import { GET } from "./route";

test("returns current tariff payload with source metadata", async () => {
  const response = await GET(new Request("http://localhost/api/tariffs/current"));
  const data = await response.json();
  expect(data.items[0]).toMatchObject({
    operatorSlug: expect.any(String),
    sourceUrl: expect.any(String),
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest src/app/api/tariffs/current/route.test.ts`
Expected: FAIL because route handler is missing.

**Step 3: Write minimal implementation**

```ts
export async function GET() {
  return Response.json({
    items: [
      {
        operatorSlug: "demo-operator",
        sourceUrl: "https://example.com/preise.pdf",
      },
    ],
  });
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest src/app/api/tariffs/current/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add public tariff api routes"
```

### Task 6: Table UI On Shared Data Layer

**Files:**
- Create: `src/components/tariff-table.tsx`
- Create: `src/components/tariff-table.test.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/lib/view-models/tariffs.ts`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { TariffTable } from "./tariff-table";

test("renders operator rows with current tariff value", () => {
  render(
    <TariffTable
      rows={[{ operatorName: "Demo Netz", currentValue: "12.34 ct/kWh" }]}
    />,
  );
  expect(screen.getByText("Demo Netz")).toBeInTheDocument();
  expect(screen.getByText("12.34 ct/kWh")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest src/components/tariff-table.test.tsx`
Expected: FAIL because the component does not exist.

**Step 3: Write minimal implementation**

```tsx
export function TariffTable({ rows }: { rows: Array<{ operatorName: string; currentValue: string }> }) {
  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.operatorName}>
            <td>{row.operatorName}</td>
            <td>{row.currentValue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest src/components/tariff-table.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add tariff table view"
```

### Task 7: Interactive Map With Operator Hover

**Files:**
- Create: `src/components/operator-map.tsx`
- Create: `src/components/operator-map.test.tsx`
- Create: `src/lib/maps/geojson.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { OperatorMap } from "./operator-map";

test("shows hovered operator name in overlay", () => {
  render(
    <OperatorMap
      features={[
        { id: "demo", operatorName: "Demo Netz", geometry: null, currentValue: "12.34 ct/kWh" },
      ]}
    />,
  );
  expect(screen.getByText("Demo Netz")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest src/components/operator-map.test.tsx`
Expected: FAIL because the map component does not exist.

**Step 3: Write minimal implementation**

```tsx
export function OperatorMap({ features }: { features: Array<{ id: string; operatorName: string; currentValue: string }> }) {
  return (
    <section>
      {features.map((feature) => (
        <article key={feature.id}>
          <h2>{feature.operatorName}</h2>
          <p>{feature.currentValue}</p>
        </article>
      ))}
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest src/components/operator-map.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add operator map slice"
```

### Task 8: Remote Bootstrap And Runbooks

**Files:**
- Create: `docs/runbooks/lxc-bootstrap.md`
- Create: `docs/runbooks/source-refresh.md`
- Create: `scripts/bootstrap/remote-setup.sh`
- Create: `scripts/bootstrap/install-system-packages.sh`
- Test: `scripts/bootstrap/remote-setup.sh`

**Step 1: Write the failing test**

```bash
bash scripts/bootstrap/remote-setup.sh --check
```

Expected: non-zero exit because required commands and env files are not wired yet.

**Step 2: Run test to verify it fails**

Run: `bash scripts/bootstrap/remote-setup.sh --check`
Expected: FAIL because scripts are missing.

**Step 3: Write minimal implementation**

```bash
#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--check" ]]; then
  command -v node >/dev/null
  command -v psql >/dev/null
fi
```

**Step 4: Run test to verify it passes**

Run: `bash scripts/bootstrap/remote-setup.sh --check`
Expected: PASS once system packages are installed.

**Step 5: Commit**

```bash
git add .
git commit -m "docs: add bootstrap and refresh runbooks"
```

## Verification Matrix

- `pnpm lint`
- `pnpm typecheck`
- `pnpm vitest run`
- `pnpm playwright test`
- `pnpm drizzle-kit check`
- `bash scripts/bootstrap/remote-setup.sh --check`

## Rollback Notes

- Keep schema changes additive until ingestion is stable.
- Run ingestion against a seed subset before full operator rollout.
- Ship API behind sample data before enabling public refresh jobs.
- Treat parser changes per operator as isolated units to avoid wide regressions.
