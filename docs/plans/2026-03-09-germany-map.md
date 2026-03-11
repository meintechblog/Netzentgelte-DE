# Germany Map Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the abstract operator node map with a dominant Germany hero map that places known operators on a scale-faithful SVG map and keeps search, detail view, and tariff matrix in sync.

**Architecture:** Keep the current server-side operator loading, but introduce a dedicated geo seed and a richer map view-model for presentation. Render a responsive SVG Germany base with curated operator regions or fallbacks, wire it through a client hero component, and preserve a clean upgrade path toward PostGIS-backed geometries later.

**Tech Stack:** Next.js, React 19, TypeScript, Vitest, CSS, existing operator registry seed

---

### Task 1: Lock the new map contract in tests

**Files:**
- Modify: `src/components/operator-map.test.tsx`
- Modify: `src/components/operator-explorer.test.tsx`
- Modify: `src/app/page.test.tsx`

**Step 1: Write the failing tests**

Add tests that assert:
- the hero map renders an SVG Germany stage instead of only floating buttons
- operator regions expose map labels and precision metadata
- filtering keeps the detail panel and visible regions in sync
- the page shell now contains the dominant map hero content

**Step 2: Run targeted tests to verify they fail**

Run:
- `pnpm vitest run src/components/operator-map.test.tsx`
- `pnpm vitest run src/components/operator-explorer.test.tsx`
- `pnpm vitest run src/app/page.test.tsx`

Expected: FAIL because the current map model has no geometry metadata or hero rendering.

### Task 2: Introduce curated geo seed data and map view-models

**Files:**
- Create: `data/geo/operator-map-seed.json`
- Modify: `src/lib/maps/geojson.ts`
- Modify: `src/lib/api/serializers.ts`
- Add tests if needed under: `src/lib/maps/`

**Step 1: Define the geo seed**

Store per operator:
- region path or fallback shape reference
- map label
- map rank
- coverage type
- geometry precision
- centroid / label anchor

**Step 2: Expand the map feature model**

Make `OperatorMapFeature` rich enough for:
- SVG path rendering
- label placement
- focus styling
- provenance display of geometry precision

**Step 3: Run targeted tests**

Run:
- `pnpm vitest run src/components/operator-map.test.tsx src/components/operator-explorer.test.tsx`

Expected: still FAIL until the rendering layer consumes the richer model.

### Task 3: Build the hero Germany map renderer

**Files:**
- Modify: `src/components/operator-map.tsx`
- Modify: `src/app/globals.css`

**Step 1: Write the failing rendering assertion**

Add a test expecting:
- SVG base map
- visible operator regions or fallback regions
- active region styling
- precision badge or label in the detail panel

**Step 2: Implement the minimal SVG hero map**

Replace the current absolute-position node cloud with:
- a Germany SVG base
- path or region overlays for operators
- click and hover focus
- safe empty state when no regions match the filter

**Step 3: Run targeted tests to verify they pass**

Run:
- `pnpm vitest run src/components/operator-map.test.tsx`

Expected: PASS

### Task 4: Rework the page structure around the hero map

**Files:**
- Modify: `src/components/operator-explorer.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.test.tsx`

**Step 1: Write the failing layout test**

Assert that:
- the search lives inside the map hero block
- the hero renders map-first with detail panel and summary chips
- the tariff matrix moves below the map hero without losing filtering

**Step 2: Implement the minimal layout change**

Create a dominant top-of-page map hero that:
- integrates search
- keeps live filtering behavior
- pushes tariff table below the hero map

**Step 3: Run targeted tests**

Run:
- `pnpm vitest run src/components/operator-explorer.test.tsx src/app/page.test.tsx`

Expected: PASS

### Task 5: Add operator map attributes that improve placement and readability

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `src/modules/operators/registry.ts`
- Modify: `src/lib/view-models/tariffs.ts` only if the UI needs cross-link metadata
- Update or add tests: `src/modules/operators/registry.test.ts`

**Step 1: Write the failing registry test**

Assert that operators needed by the hero map expose the placement attributes required by the geo seed or that the registry and geo seed join cleanly on slug.

**Step 2: Implement the minimal metadata extension**

Add only the attributes required for meaningful map presentation, such as improved regional labels or stable map display labels.

**Step 3: Run targeted tests**

Run:
- `pnpm vitest run src/modules/operators/registry.test.ts`

Expected: PASS

### Task 6: Full verification and release prep

**Files:**
- No new feature files; verify all touched files

**Step 1: Run full verification**

Run:
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

Expected: all commands exit `0`

**Step 2: Prepare release notes**

Record:
- which operators now have curated map placement
- which shapes are approximate vs more exact
- what remains to migrate into PostGIS later

**Step 3: Commit**

```bash
git add data/geo/operator-map-seed.json data/source-registry/operators.seed.json src/lib/maps/geojson.ts src/components/operator-map.tsx src/components/operator-explorer.tsx src/app/page.tsx src/app/globals.css src/components/operator-map.test.tsx src/components/operator-explorer.test.tsx src/app/page.test.tsx src/modules/operators/registry.ts
git commit -m "feat: add germany hero map"
```
