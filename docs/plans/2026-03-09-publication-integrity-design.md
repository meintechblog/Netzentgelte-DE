# Publication Integrity Design

## Goal

Alle öffentlich sichtbaren Daten für `§14a Modell 3` dürfen nur dann auf Webapp und API erscheinen, wenn sie die harten Korrektheits- und Nachweisregeln erfüllen. `pending` oder unvollständig belegte Datensätze gehören nicht in den öffentlichen Standardpfad.

## Decision

Die Plattform verwendet ab jetzt einen `Hard Publish Gate`.

- Öffentlich sichtbar: nur `verified` und `publishable`
- Intern oder im Arbeitsstand: `pending`, unvollständig, inkonsistent oder technisch nicht belegbar
- Kein Split zwischen „lockerer UI“ und „strenger API“

## Alternatives Considered

### 1. Hard Publish Gate

Nur vollständig geprüfte Datensätze werden publiziert.

Pros:
- Entspricht dem Qualitätsanspruch `100% richtig`
- Verhindert, dass Nutzer oder Fremdprojekte halbfertige Daten übernehmen
- Macht den Review-Status operativ relevant statt nur kosmetisch

Cons:
- Sichtbare Abdeckung wächst langsamer
- Mehr Betreiber bleiben intern, bis alle Nachweise komplett sind

### 2. Public Pending Status

`pending` bleibt öffentlich sichtbar, aber markiert.

Pros:
- Mehr Abdeckung

Cons:
- Verletzt das Qualitätsziel
- Nutzer sehen trotzdem unvollständige oder strittige Daten

### 3. UI/API Split Gate

UI darf mehr zeigen, API nur verified.

Pros:
- Flexibler Übergang

Cons:
- Zwei Wahrheiten
- Schwer verständlich und riskant für Vertrauen

## Publishability Rules

Ein Betreiber ist nur `publishable`, wenn alle folgenden Gates erfüllt sind:

1. `review_status_verified`
2. `source_page_url_present`
3. `document_url_present`
4. `valid_from_present`
5. `band_count_complete`
6. `band_values_complete`
7. `band_source_quotes_complete`
8. `time_windows_present`
9. `time_window_quotes_complete`
10. `artifact_evidence_present`
11. `quarter_matrix_consistent`
12. `no_conflicting_band_entries`

## Evidence Rules

Für jeden öffentlich sichtbaren Betreiber muss es mindestens geben:

- eine offizielle Quellseite
- ein offizielles PDF oder Dokument
- Reviewstatus `verified`
- strukturierte Bandwerte
- strukturierte Zeitfenster
- `sourceQuote` für Bandwerte und Zeitfenster
- gespeicherte Artefakt- oder Snapshot-Metadaten, sodass der Prüfpfad nicht nur auf nackten Links basiert

## Special Rule: Stadtwerke Schwäbisch Hall

Für `stadtwerke-schwaebisch-hall` gilt zusätzlich ein harter Quartalscheck aus dem offiziellen 2026er Preisblatt:

- `Q1`, `Q2`, `Q4` enthalten genau `ST`, `HT`, `NT`
- `Q3` enthält nur `ST`
- `Q3` enthält `00:00-24:00`
- `Q3` enthält keine `HT`- oder `NT`-Zeitfenster

Dieser Betreiber ist der Referenzfall für quartalsabhängige Sonderlogik.

## Public Read Model

Die öffentliche Plattform arbeitet mit zwei Ebenen:

- `integrity report`: maschinenlesbarer Prüfbericht pro Betreiber
- `publishable operators`: gefilterter öffentlicher Bestand

Webapp, Karte, Kennzahlen und öffentliche API hängen nur noch an `publishable operators`.

## Failure Handling

Wenn ein Datensatz eines der Gates verletzt:

- fällt er aus `loadPublishedOperators` heraus
- taucht nicht mehr in öffentlicher UI oder API auf
- bleibt aber im Seed/DB-Arbeitsstand erhalten
- erscheint im Integritätsbericht mit konkreten Fehlgründen

## Testing Strategy

- Unit-Tests für jede zentrale Gate-Regel
- Regression für `Stadtwerke Schwäbisch Hall`
- Loader-Tests für `verified-only` und `publishable-only`
- API/Page-Tests prüfen, dass öffentliche Counts und Ergebnisse nur publishable Betreiber enthalten

