# Endcustomer Integrity Audit Design

## Goal

Make the low-voltage endcustomer model operationally safe to scale beyond the Schwäbisch-Hall reference by sharing one strict completeness definition between the public UI and an internal audit API.

## Problem

The public UI already renders a DB-backed `Modul 1/2/3 + Messung` block, but the strictness currently only lives inside the tariff view-model. That makes two things harder than they need to be:

- backfill agents cannot ask the system which published operators are still missing endcustomer data
- the public render gate and internal quality checks can drift if they do not reuse the exact same integrity logic

## Recommended Approach

Introduce a shared `endcustomer-integrity` module in `src/modules/tariffs/` that:

- selects the newest complete verified product set for one operator
- validates required components, requirements, time windows, and metering prices
- exposes a machine-readable audit report for every published operator

Then:

- update the public tariff view-model to consume the shared selector instead of its private helper logic
- add an internal API route that returns the audit summary and concrete gaps per published operator

## Completeness Rules

For a published operator to be `complete` for the endcustomer model:

- `Modul 1` must have:
  - `base_price_eur_per_year`
  - `work_price_ct_per_kwh`
  - `net_fee_reduction_eur_per_year`
  - requirements:
    - `default_if_no_choice`
    - `zero_floor_applies`
- `Modul 2` must have:
  - `base_price_eur_per_year`
  - `work_price_ct_per_kwh`
  - requirements:
    - `separate_meter_required`
    - `separate_market_location_required`
- `Modul 3` must have:
  - `standard_work_price_ct_per_kwh`
  - `high_work_price_ct_per_kwh`
  - `low_work_price_ct_per_kwh`
  - requirements:
    - `intelligent_meter_required`
    - `must_be_combined_with_module_1`
  - at least one structured time window
- metering must have:
  - `single_register_meter_eur_per_year`
  - `dual_register_meter_eur_per_year`

Only a verified set with one shared `validFrom` may be selected as current.

## Outputs

New internal API:

- `GET /api/tariffs/endcustomer/audit`

Response should include:

- summary counts
- one item per published operator
- status:
  - `complete`
  - `missing-entry`
  - `incomplete`
- concrete issue keys and messages
- next suggested backfill targets

## Testing

- unit tests for the shared integrity module
- regression that missing requirements or missing metering suppress public rendering
- route test for the new audit API

