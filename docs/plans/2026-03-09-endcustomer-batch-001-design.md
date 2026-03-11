# Endcustomer Batch 001 Design

## Goal

Expand the low-voltage endcustomer model from one operator reference to a first safe multi-operator batch using only official 2026 source documents that already expose `Modul 1`, `Modul 2`, `Modul 3`, and metering prices.

## Recommended Batch

- `netze-bw`
- `stromnetz-berlin`
- `netze-odr`
- `mitnetz-strom`

All four operators are already publicly published in the operator view and have official 2026 source documents with enough data to populate the endcustomer model without guessing.

## Approach

Keep the current curated-reference approach, but stop treating Schwäbisch Hall as a one-off.

- add a shared seed/reference list for multiple operators
- derive the seed-backed endcustomer catalog from that shared list
- turn the CLI import into a batch importer that can import all references or one selected operator
- reuse the existing persistence layer unchanged

## Why This Approach

- lowest conflict risk with the ongoing registry/source backfill work
- improves the live audit count immediately
- keeps the data model strict and reviewable
- creates a reusable path for later operator batches

## Data Rules

For each operator in this batch:

- `Modul 1` stores standard low-voltage base/work prices plus the module-1 reduction
- `Modul 2` stores the reduced work price and a `0.00` base price when the source does not define one
- `Modul 3` stores ST/HT/NT prices plus structured quarter windows
- metering stores one annual `Eintarif` and one annual `Zweitarif` price

## Verification

- seed catalog includes all new references
- endcustomer audit complete count increases
- endcustomer current API returns the new operators
- batch import CLI imports all references into Postgres on the LXC

