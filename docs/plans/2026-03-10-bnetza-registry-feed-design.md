# BNetzA Registry Feed Design

## Goal

Die quartalsweise BNetzA-Roll-out-Liste soll als offizielle Discovery-Quelle fuer Netzbetreiber in die Shell-Registry einfliessen. Neue Betreiber aus dem Feed werden erfasst, spaeter fehlende Betreiber koennen als `disappearance-review` bzw. `deprecated` markiert werden, ohne Historie zu verlieren.

## Recommended Approach

Wir behandeln den Feed als `registry evidence`, nicht als alleinige Wahrheitsquelle fuer Stilllegungen. Die Registry speichert pro Shell:

- aus welchem Registry-Feed der Betreiber zuletzt stammt
- wann er zuletzt im Feed gesehen wurde
- welchen `deprecatedStatus` er hat
- warum er ggf. als deprecated markiert wurde

Die Shell-Batches bekommen zusaetzlich eine priorisierte Lane `registry-review`, damit neu im offiziellen Feed auftauchende Betreiber zuerst mit Quellen und Preisblaettern angereichert werden.

## Data Model

Erweiterungen fuer `operator_shells` und die Seed-Registry:

- `registryFeedSource`
- `registryFeedLabel`
- `lastSeenInRegistryFeed`
- `deprecatedStatus`
- `deprecatedCheckedAt`
- `deprecatedReason`

`deprecatedStatus` wird als `active | disappearance-review | deprecated` modelliert.

## Audits And Batches

- Neuer interner Audit-Feed fuer Registry-Abweichungen:
  - Betreiber neu aus dem letzten Feed
  - Betreiber im `disappearance-review`
  - Betreiber als `deprecated`
- `buildShellBackfillBatches` bekommt die Lane `registry-review`
- `backfill-briefing` priorisiert `registry-review` vor generischen Discovery-Batches

## Publication Rule

Deprecated Betreiber bleiben intern erhalten, werden aber standardmaessig nicht als aktive Ausbaukandidaten behandelt. Oeffentliche Tarif- und Betreiberlisten bleiben unveraendert an den bestehenden `verified/publishable`-Gates ausgerichtet.

## Initial Scope

Der erste Slice setzt die Modell- und Audit-Huelle um und markiert die aus der BNetzA-Q3-2025-Liste neu ergaenzten Shells entsprechend. Eine automatische `deprecated`-Herleitung aus kuenftigen Feeds wird damit vorbereitet, aber nicht geraten.
