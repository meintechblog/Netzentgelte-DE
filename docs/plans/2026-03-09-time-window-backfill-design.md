# Time Window Backfill Design

## Goal

Backfill the missing official `§14a Modul 3` time windows for already published operators and make the tariff matrix easier to read by grouping schedules by active period instead of showing one flat list.

## Current Gap

The app already shows real tariff bands, source links and review state, but five published operators still fall back to "Zeitfenster noch nicht strukturiert". This weakens the core comparison use case because users need to know not only the band values, but exactly when each price applies.

## Approaches

### 1. Data-only backfill, keep current flat card list

- Pros: smallest code change
- Cons: still makes seasonal logic hard to scan when an operator has multiple schedules

### 2. Backfill time windows and group them by season or validity block in the matrix

- Pros: keeps the table compact while making winter/summer or quarter-based logic obvious
- Pros: works with operator-specific schedule models without forcing rigid columns
- Cons: small UI and test change in addition to seed updates

### 3. Move all schedule detail into a modal or drawer

- Pros: more visual space per operator
- Cons: hurts comparison and adds navigation friction

## Recommendation

Use approach 2.

The curated registry stays the system of record for this slice. We enrich the missing operator entries with official time windows, add discovery-source metadata for future refresh runs, and update the matrix to render grouped schedule clusters per `seasonLabel`.

## Data Design

- Keep `timeWindows` as the canonical curated structure for now.
- Continue storing `bandKey`, `seasonLabel`, `dayLabel`, `timeRangeLabel` and `sourceQuote`.
- Add discovery-source entries for every newly backfilled operator source so later refresh work has a documented source page, PDF URL pattern and artifact checklist.

## UI Design

- Keep the current compact band summary in the first visible line.
- Under it, render grouped schedule sections:
  - section title = `seasonLabel`
  - cards within the section = individual tariff windows
- Keep the current source and review affordances unchanged.
- Preserve readable mobile behavior by stacking grouped sections vertically inside the existing tariff cell.

## Validation

- Tests must fail first for:
  - missing time windows on the five operators
  - grouped season rendering in the tariff matrix
- After implementation:
  - local full suite green
  - remote import count stays consistent
  - live UI shows real schedules for the backfilled operators
