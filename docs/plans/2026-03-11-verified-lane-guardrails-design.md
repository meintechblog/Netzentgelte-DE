# Verified Lane Guardrails Design

## Problem

Die `verified-first`-Lane bevorzugt derzeit bereits publizierte Shells mit offizieller Quellseite und PDF-Link. Das ist zu locker: Shell-only-Faelle wie `abita-energie-otterberg` oder `stadtwerke-achim` koennen dadurch nach oben rutschen, obwohl ihre 2026-Modul-3-Logik nach Sichtung nicht homepage-tauglich ist.

## Ziel

Der Koordinator soll bevorzugt Betreiber auswaehlen, die im selben Lauf realistisch bis `reviewStatus=verified` gebracht werden koennen. Bereits auditierte Dead Ends muessen automatisch aus der Top-Lane fallen, ohne neue Sonderlogik im Deploy- oder Public-Teil.

## Entscheidung

Wir bauen eine kleine, deterministische Guardrail direkt in den Verified-Candidate-Selector:

- Registry-`pending` mit explizitem `summaryFallback` bleibt `evidence-ready` oder `blocked`, nie blind `verification-ready`.
- Shell-Notizen mit klaren Non-Publishability-Signalen wie `nur fuer q1/q4`, `keine publizierbare jahresmatrix`, `widerspruechlich`, `vorlaeufig`, `fiktiv` blocken die Verify-Lane.
- Shell-only-Kandidaten mit Artefakt, aber ohne extrahierte Tarifspur bleiben standardmaessig `evidence-ready`. Sie koennen weiterhin ausgewaehlt werden, aber nicht mehr vor strukturierten Registry-Kandidaten.

## Operatives Modell

1. Kandidat selektieren.
2. Offizielle Seite und PDF pruefen.
3. Wenn Volljahresmatrix mit NT/ST/HT plus Zeitfenstern explizit vorliegt: direkt in `operators.seed.json` verifizieren.
4. Wenn nicht: Shell-Notiz mit dem konkreten fachlichen Grund anreichern, damit derselbe Dead End nicht wieder priorisiert wird.

## Erfolgskriterien

- `abita-energie-otterberg` und vergleichbare Faelle sind nicht mehr Top-Kandidat fuer die Verify-Lane.
- Ein neuer Betreiber geht nach dem Umbau direkt live in den Hauptkatalog.
- Homepage-Wachstum bleibt die primäre Erfolgsmetrik.
