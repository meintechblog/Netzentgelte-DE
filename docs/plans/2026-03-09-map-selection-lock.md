# Map Selection Lock Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Betreiber auf der Deutschlandkarte sollen per Klick fixiert und per Klick auf leere Kartenflaeche wieder entsperrt werden.

**Architecture:** Die Kartenkomponente trennt fluechtige Hover-Auswahl von explizitem Lock-Zustand. Die aktive Detailansicht priorisiert den Lock, faellt bei Entsperrung wieder auf Hover oder den ersten passenden Betreiber zurueck.

**Tech Stack:** React 19, Next.js App Router, TypeScript, Vitest, Testing Library, SVG Interaction

---

### Task 1: Failing tests fuer Karten-Lock schreiben

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.test.tsx`

**Step 1: Write the failing test**

- Test fuer `click locks active operator`
- Test fuer `hover does not replace locked operator`
- Test fuer `click empty map clears lock`
- Optional: `Escape clears lock`

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/operator-map.test.tsx`

**Step 3: Write minimal implementation**

- Noch nicht, erst nach rotem Test.

**Step 4: Commit**

```bash
git add /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.test.tsx
git commit -m "test: cover map selection lock"
```

### Task 2: Lock-/Unlock-Logik in der Karte implementieren

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.tsx`

**Step 1: Write minimal implementation**

- `lockedFeatureId` einfuehren
- aktive Feature-Auswahl aus `lockedFeatureId` und Hover ableiten
- leerer SVG-Hintergrund hebt Lock auf
- Tastatur-Interaktion erweitern

**Step 2: Run test to verify it passes**

Run: `pnpm test src/components/operator-map.test.tsx`

**Step 3: Small cleanup**

- Statuslabel im Detailpanel ergaenzen

**Step 4: Commit**

```bash
git add /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.tsx
git commit -m "feat: lock map operator selection"
```

### Task 3: Regression checks und Deploy

**Files:**
- None or incidental

**Step 1: Run full verification**

```bash
pnpm test
pnpm lint
pnpm build
pnpm typecheck
```

**Step 2: Deploy to LXC and verify**

- Release nach `/root/netzentgelte-de-release`
- Release-Checks im Container
- Live-Check auf `http://192.168.3.178:3000`

**Step 3: Commit**

```bash
git add -A
git commit -m "docs: record map selection lock"
```
