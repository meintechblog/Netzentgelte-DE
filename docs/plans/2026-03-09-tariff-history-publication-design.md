# Tariff History Publication Design

## Goal

Publish a real `GET /api/tariffs/history` endpoint backed by the existing database instead of returning `501`, while preserving the current provenance model and staying compatible with the seed-backed fallback used in tests.

## Why This Slice Now

- `source_snapshots` and `tariff_versions` already exist in the schema.
- The refresh pipeline already stores snapshot hashes and artifact paths.
- The app exposes current tariffs and current sources, but historical tariff access is still intentionally unavailable.

This leaves an obvious API gap for later update runs.

## Approaches

### 1. Keep `501` until multiple historical price revisions exist for many operators

- Pros: no implementation work
- Cons: blocks external consumers and leaves the most obvious missing endpoint unfinished

### 2. Publish history now from the existing DB model

- Pros: unblocks consumers immediately
- Pros: compatible with later multi-version data, because the payload can already carry snapshot metadata
- Pros: works even if many operators currently only have one published revision
- Cons: first version of the endpoint will be thin for operators without historical refreshes

### 3. Build full parser-driven diff tracking before publishing the endpoint

- Pros: strongest eventual model
- Cons: too large for the next slice and delays a useful API unnecessarily

## Recommendation

Use approach 2.

The endpoint should expose the current contents of `tariff_versions` as a historical feed grouped by operator/version semantics, with provenance fields that help a human reviewer understand where the row came from:

- operator slug and name
- `validFrom` and `validUntil`
- band values
- source slug
- source page URL
- document URL
- latest available snapshot metadata for the source
- human review status
- seed-compatible `timeWindows`

## Data Model Notes

- Keep `tariff_versions` as the canonical historical price table.
- Do not change persistence semantics in this slice.
- Join `source_catalog` to recover source metadata.
- Join or derive the latest `source_snapshots` per source for hash and artifact visibility.
- Continue using curated seed `timeWindows` until parser-specific storage for schedules exists in the DB.

## API Shape

- `GET /api/tariffs/history`
- Optional filter: `operator=<slug>`
- Response shape stays close to `/api/tariffs/current`, but each item represents one stored version row group, not just the latest current operator view.

## Validation

- Add test coverage for:
  - seed fallback behavior in test mode
  - DB-backed build/group behavior
  - route filtering by operator slug
  - route returning data instead of `501`
- Run full local verification and remote release verification before claiming completion.
