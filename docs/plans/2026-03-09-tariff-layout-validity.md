# Tariff Layout Validity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Die Quartalsmatrix so umbauen, dass sie ohne horizontales Ausbrechen lesbar bleibt, Zeitfenster chronologisch zeigt und die Preiszusammenfassung deutlich kompakter darstellt.

**Architecture:** Das bestehende Tarif-Read-Model wird um kompakte Band-Badges und eine harte Zeitfenster-Sortierung erweitert. Die UI bleibt als Desktop-Tabelle erhalten, kippt aber per CSS an einem definierten Breakpoint in kompakte Betreiber-Cards mit `2x2`-Quartalsgrid. Browser-Validierung prueft die eigentliche Viewport-Stabilitaet.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library, CSS, Playwright CLI

---

### Task 1: Sortierung und kompakte Tarif-Badges im Read-Model

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/quarterly-tariffs.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.test.ts`

**Step 1: Write the failing test**

- Erweitere `tariffs.test.ts` um:
  - einen Fall fuer chronologisch sortierte `timeRanges`
  - einen Fall fuer Sammelwerte wie `Alle anderen Zeiten` am Ende
  - einen Fall fuer kompakte Band-Badges im Row-View-Model

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/view-models/tariffs.test.ts`

**Step 3: Write minimal implementation**

- Fuehre eine `sortTimeRanges`-Logik ein.
- Erzeuge kompakte Band-Badges aus den veroeffentlichten Betreiber-Bands.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/view-models/tariffs.test.ts`

**Step 5: Commit**

```bash
git add /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/quarterly-tariffs.ts /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.ts /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.test.ts
git commit -m "refactor: sort quarterly time ranges"
```

### Task 2: Tarifmatrix kompakter und menschlich lesbarer rendern

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.tsx`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.test.tsx`

**Step 1: Write the failing test**

- Erweitere `tariff-table.test.tsx` um:
  - keine lange Band-Summary mehr
  - sichtbare kompakte Tarif-Badges
  - chronologische Reihenfolge in der `Q1`-Zelle fuer Schwäbisch Hall

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/tariff-table.test.tsx`

**Step 3: Write minimal implementation**

- Rendere Tarif-Badges statt des langen Monospace-Satzes.
- Ziehe die Quartalszellen dichter und klarer zusammen.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/components/tariff-table.test.tsx`

**Step 5: Commit**

```bash
git add /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.tsx /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.test.tsx
git commit -m "feat: compact tariff matrix presentation"
```

### Task 3: Responsive Layout gegen horizontales Ausbrechen haerten

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.test.tsx`

**Step 1: Write the failing test**

- Ergaenze einen Testhinweis fuer die kompakte Tarifsektion, falls noetig mit stabilen Texten/Labels.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/app/page.test.tsx`

**Step 3: Write minimal implementation**

- Reduziere feste Tabellenbreiten.
- Fuehre einen Breakpoint ein, der Zeilen in kompakte Cards ueberfuehrt.
- Stelle Umbruch fuer lange Slugs/Quellen sicher.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/app/page.test.tsx`

**Step 5: Commit**

```bash
git add /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.test.tsx
git commit -m "fix: prevent tariff layout overflow"
```

### Task 4: Vollverifikation und Browser-Check

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/runbooks/lxc-release.md`

**Step 1: Run full local verification**

Run:

```bash
pnpm test
pnpm lint
pnpm build
pnpm typecheck
```

**Step 2: Run browser validation**

- Nutze Playwright CLI gegen die lokale oder live laufende App.
- Pruefe bei mehreren Breiten, dass `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

**Step 3: Deploy and verify on LXC**

- Ausrollen nach `/root/netzentgelte-de-release`
- Release-Checks im Container laufen lassen
- Live-Checks gegen `http://192.168.3.178:3000`

**Step 4: Commit**

```bash
git add /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/runbooks/lxc-release.md
git commit -m "docs: add tariff layout validation notes"
```
