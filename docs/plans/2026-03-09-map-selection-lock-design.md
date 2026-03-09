# Map Selection Lock Design

## Ziel

Die Deutschlandkarte soll Hover fuer schnelle Vorschau behalten, aber per Klick einen Netzbetreiber explizit fixieren koennen. Ein Klick auf leere Kartenflaeche hebt diese Fixierung wieder auf.

## Interaktionsmodell

- `Hover`: zeigt wie bisher eine Vorschau im rechten Detailpanel.
- `Click on operator`: sperrt die aktuelle Auswahl.
- `Locked state`: weitere Hover-Ereignisse aendern den Detailinhalt nicht mehr.
- `Click on empty map area`: hebt den Lock auf.
- `Filter/search`: wenn ein gelockter Betreiber aus der Ergebnisliste faellt, wird der Lock automatisch geloescht.
- `Keyboard`: `Enter` und `Space` setzen den Lock auf dem fokussierten Betreiber, `Escape` loest ihn.

## UX-Details

- Das Detailpanel zeigt im Lock-Zustand einen klaren Status an, dass die Auswahl fixiert ist.
- Ein ungelockter Zustand bleibt leichtgewichtig und reaktiv auf Hover.
- Das Entsperren passiert direkt auf der Kartenbuehne, nicht ueber einen separaten Button.

## Technischer Ansatz

- `operator-map.tsx` bekommt getrennte Zustandslogik fuer:
  - `hoveredFeatureId`
  - `lockedFeatureId`
- Das aktive Detailpanel ergibt sich aus `lockedFeatureId ?? hoveredFeatureId ?? firstMatchingFeature`.
- Die SVG bekommt einen Hintergrund-Layer, der Klicks auf leere Kartenflaeche empfaengt.
- Tests decken Hover, Lock, Unlock und Filter-Reset ab.
