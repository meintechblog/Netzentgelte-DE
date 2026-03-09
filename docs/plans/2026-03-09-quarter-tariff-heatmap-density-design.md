# Quarter Tariff Heatmap Density Design

## Goal

Die 24h-Matrix soll deutlich kompakter werden, ohne die bestehende Quarter-Logik, Farben oder Slot-Semantik zu aendern.

## Decision

Wir reduzieren nur die visuelle Hoehe:

- Viertelstunden-Slots werden etwa halb so hoch dargestellt.
- Zeilenabstaende werden ebenfalls reduziert.
- Stundenlabels bleiben erhalten, werden aber leicht kleiner gesetzt, damit die Gesamtmatrix sichtbar schrumpft.

## Non-Goals

- Keine Aenderung an Tarifdaten oder Slot-Belegung
- Kein Umbau der Matrixstruktur
- Keine neue Interaktion
