# Projected Germany Map Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hand-drawn Germany hero map with a projection-based SVG map that renders real Germany geometry, uses WGS84 coordinates for operator placement, and drives the right-side detail rail from hover/focus interactions.

**Architecture:** Keep operators loaded from the existing registry and database-backed publication path, but replace the current `svg-path` seed with a geographic seed. Render Germany and Bundesländer from GeoJSON, project all geometries with `d3-geo`, and layer operator interaction zones above the base map with explicit precision metadata.

**Tech Stack:** Next.js, React 19, TypeScript, Vitest, D3 Geo, GeoJSON, CSS

---

### Task 1: Lock the geographic map contract in tests

**Files:**
- Modify: `src/components/operator-map.test.tsx`
- Modify: `src/components/operator-explorer.test.tsx`
- Modify: `src/app/api/geo/operators/route.test.ts`
- Modify: `src/lib/maps/geojson.ts` tests if created

**Step 1: Write the failing tests**

Assert that:
- the map renders a real Germany base and state boundaries
- operators no longer render visible map labels
- projected operator zones remain interactive and update the detail rail
- the API emits coordinate-based metadata instead of raw SVG paths

**Step 2: Run targeted tests to verify they fail**

Run:
- `pnpm vitest run src/components/operator-map.test.tsx`
- `pnpm vitest run src/components/operator-explorer.test.tsx`
- `pnpm vitest run src/app/api/geo/operators/route.test.ts`

Expected: FAIL because the current model is still SVG-path based.

### Task 2: Replace the map seed with geographic source data

**Files:**
- Create: `data/geo/germany-states.geo.json`
- Modify: `data/geo/operator-map-seed.json`
- Modify: `src/lib/maps/geojson.ts`
- Modify: `src/lib/api/serializers.ts`

**Step 1: Define geographic seed data**

Store per operator:
- anchor longitude and latitude
- optional overlay GeoJSON geometry
- coverage kind and precision
- map priority
- state hints

**Step 2: Build the projection view-model**

Expose:
- Germany and state features
- projected interaction geometry for each operator
- display metadata for the detail rail

**Step 3: Run targeted tests**

Run:
- `pnpm vitest run src/components/operator-map.test.tsx src/app/api/geo/operators/route.test.ts`

Expected: still FAIL until the renderer switches to the new model.

### Task 3: Rebuild the hero map renderer around projection

**Files:**
- Modify: `src/components/operator-map.tsx`
- Modify: `src/app/globals.css`

**Step 1: Write the failing rendering assertion**

Assert:
- Germany silhouette is visually present
- state borders render
- operator overlays are hoverable/focusable
- no operator names are painted inside the map

**Step 2: Implement the minimal renderer**

Use `d3-geo` to:
- fit Germany into the SVG viewport
- render base and state layers
- project operator anchors or zones into SVG paths
- update the detail rail on hover/focus/click

**Step 3: Run targeted tests**

Run:
- `pnpm vitest run src/components/operator-map.test.tsx`

Expected: PASS

### Task 4: Rework hero layout and search behavior

**Files:**
- Modify: `src/components/operator-explorer.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Step 1: Write the failing layout and filter tests**

Assert that:
- the map hero stays dominant
- search dims and filters map overlays during typing
- the detail rail stays in sync with the active filtered operator

**Step 2: Implement the layout update**

Polish the map hero to:
- keep the map visually dominant
- keep the right rail stable
- preserve fast filter behavior

**Step 3: Run targeted tests**

Run:
- `pnpm vitest run src/components/operator-explorer.test.tsx`

Expected: PASS

### Task 5: Verification, release, and deployment

**Files:**
- Modify docs only if release notes need updates

**Step 1: Run full verification**

Run:
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

**Step 2: Deploy to the LXC**

Run the usual release sync, install any new dependencies, rebuild, and restart the app.

**Step 3: Live-check**

Verify:
- `/` shows the new projection-based Germany hero map
- `/api/geo/operators` emits coordinate metadata
- the search and detail rail behave correctly in the browser

**Step 4: Commit**

```bash
git add data/geo/germany-states.geo.json data/geo/operator-map-seed.json src/lib/maps/geojson.ts src/lib/api/serializers.ts src/components/operator-map.tsx src/components/operator-explorer.tsx src/app/page.tsx src/app/globals.css src/components/operator-map.test.tsx src/components/operator-explorer.test.tsx src/app/api/geo/operators/route.test.ts docs/plans/2026-03-09-projected-germany-map-design.md docs/plans/2026-03-09-projected-germany-map.md
git commit -m "feat: project germany hero map from geo data"
```
