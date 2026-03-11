# Remove Map Legend Design

## Ziel
Der Legendenblock in der Hero-Karte mit `Belegte Netzgebiete`, `x exakt verankert`, `Nicht verankerte Flächen bleiben neutral` und `Klick fixiert, freie Fläche löst` soll komplett entfernt werden.

## Optionen
1. Komplett entfernen.
   Empfehlung. Die Karte bleibt ruhiger, und die Hinweise liefern keinen kritischen Mehrwert fuer die Hauptnutzung.
2. In reduzierte Ein-Zeilen-Metadaten umbauen.
   Technisch einfach, aber visuell weiterhin Ballast.
3. In den Detailbereich verschieben.
   Unnoetig, weil die Informationen dort ebenfalls keinen starken Nutzerwert haben.

## Umsetzung
- Den Legend-Block aus [`/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.tsx`](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.tsx) entfernen.
- Unbenutzte Legend-CSS-Regeln aus [`/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css) entfernen.
- Den Komponententest auf die neue erwartete Abwesenheit der Legende umstellen.
