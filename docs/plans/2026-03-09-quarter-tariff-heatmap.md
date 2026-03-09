# Quarter Tariff Heatmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ersetze die bisherige Quartals-Timeline durch eine 15-Minuten-Matrix mit farbkodierten Tarifbaendern und angleiche die Preis-Badges im Betreiberblock an dieselbe Farbsemantik.

**Architecture:** Die bestehende Quarter-Matrix bleibt die zentrale View-Model-Schnittstelle, wird aber um ein explizites Slot-Grid erweitert. Die UI rendert dieses Grid in der Tariftabelle direkt aus dem View-Model, damit Logik und Darstellung sauber getrennt bleiben und Testfaelle auf Modell- und Komponentenebene moeglich bleiben.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library, CSS in `src/app/globals.css`

---

### Task 1: Quarter-Grid-Tests im View-Model

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/quarterly-tariffs.ts`

**Step 1: Write the failing test**

Ergaenze Tests fuer:

- `00:00-24:00` erzeugt 96 Slots mit demselben Band
- Winter-/Sommerlogik verteilt sich korrekt auf `Q1-Q4`
- `Alle anderen Zeiten` fuellt nur unbelegte Slots
- `22:00-00:00` belegt die letzten 8 Slots korrekt

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/lib/view-models/tariffs.test.ts`

Expected: FAIL wegen fehlender Slot-Daten im Quarter-Model

**Step 3: Write minimal implementation**

Fuehre im Quarter-Model Slot-Typen und eine Raster-Ableitung aus `timeWindows` ein.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/lib/view-models/tariffs.test.ts`

Expected: PASS

### Task 2: Tariftabellen-Rendering auf Heatmap umstellen

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.test.tsx`

**Step 1: Write the failing test**

Ersetze Timeline-Erwartungen durch Tests fuer:

- 96 Slots pro Quartal
- Stundenmarken in der Matrix
- farbige Preis-Badges links
- zugreifbare Slot-Labels pro Quartal

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/tariff-table.test.tsx`

Expected: FAIL, weil die UI noch Listen statt Grid rendert

**Step 3: Write minimal implementation**

Rendere das Quarter-Grid mit Zeitspalte, Slot-Zellen und neuen `aria-label`s. Passe die Badge-Klassen auf die neue Farbsemantik an.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/tariff-table.test.tsx`

Expected: PASS

### Task 3: Styling fuer Heatmap und Badge-Farbsemantik

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`

**Step 1: Write the failing test**

Kein eigener CSS-Test; nutze die Komponenten-Tests aus Task 2 als rote Absicherung.

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/tariff-table.test.tsx`

Expected: FAIL oder unvollstaendige Erwartungen ohne neue Klassen

**Step 3: Write minimal implementation**

Fuehre Heatmap-Grid-, Zeitachsen- und Bandfarb-Klassen ein. Entferne nicht mehr benoetigte Timeline-Stile nur dort, wo sie ersetzt werden.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/tariff-table.test.tsx`

Expected: PASS

### Task 4: Regression und Release

**Files:**
- Verify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.tsx`
- Verify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-explorer.tsx`

**Step 1: Run focused regression**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/lib/view-models/tariffs.test.ts src/components/tariff-table.test.tsx src/components/operator-explorer.test.tsx src/app/page.test.tsx`

Expected: PASS

**Step 2: Run app-level verification**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap lint`

Expected: PASS

**Step 3: Deploy to LXC**

Run the established local-to-LXC release flow, then verify the live page and affected APIs on the LXC instance.

**Step 4: Commit**

```bash
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap add docs/plans/2026-03-09-quarter-tariff-heatmap-design.md docs/plans/2026-03-09-quarter-tariff-heatmap.md src/modules/operators/quarterly-tariffs.ts src/lib/view-models/tariffs.test.ts src/components/tariff-table.tsx src/components/tariff-table.test.tsx src/app/globals.css
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap commit -m "feat: render tariff quarters as heatmaps"
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap push
```
