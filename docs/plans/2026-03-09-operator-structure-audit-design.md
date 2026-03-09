# Operator Structure Audit Design

**Date:** 2026-03-09

## Goal

Teilbefüllte Betreiber, die bereits Tarifwerte tragen, aber noch nicht sauber auf der strukturierten Zeitfenster-/Quartalslogik liegen, sollen explizit auditierbar werden, ohne parallel laufende Seed-Arbeit zu überschreiben.

## Approach

Die bestehenden Publikations-Gates bleiben der Schutz für die öffentliche Oberfläche. Zusätzlich kommt ein eigener Struktur-Audit-Layer dazu, der exakt die Betreiber meldet, deren Daten zwar teilweise befüllt sind, aber noch nicht die neue Form erfüllen.

## Rules

- Nur veröffentlichte bzw. seed-basierte Betreiber werden auditiert.
- Betreiber mit `bands`, aber ohne strukturierte `timeWindows`, werden als `legacy-unstructured-tariff` markiert.
- Betreiber mit `summaryFallback` und bewusst leerem Strukturmodell bleiben erklärbar, aber nicht irrtümlich „kaputt“.
- Der Audit darf keine Tarifwerte raten oder nachträglich rekonstruieren.

## Output

- neues internes Read-Model für Struktur-Audits
- neue API für den Audit-Feed
- Tests, die die aktuell bekannten Altbestände stabil markieren

## Why Now

Die Registry-Seed-Dateien sind parallel bereits in Bearbeitung. Ein Audit-Slice ist konfliktarm, verbessert Transparenz sofort und verhindert, dass halb strukturierte Betreiber im Bestand unbemerkt bleiben.
