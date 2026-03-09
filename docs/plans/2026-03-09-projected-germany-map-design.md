# Projected Germany Map Design

## Goal

Die Kartenbühne auf der Startseite soll wie eine echte Deutschlandkarte wirken und technisch auf einem sauberen Geomodell basieren. Deutschland und die Bundesländer werden als echte Vektorgeometrien aus GeoJSON gerendert, Betreiberpositionen werden über geografische Koordinaten verortet und erst im Frontend in SVG-Pfade projiziert.

## User Intent

Die Karte soll nicht mehr nach gemalter Approximation aussehen. Sie soll Deutschland klar erkennbar zeigen, Betreiber räumlich glaubwürdig zuordnen und beim Hover oder Fokus den rechten Detailbereich aktualisieren. Auf der Karte selbst sollen keine Namen stehen; die Karte soll ruhig, hochwertig und präsent wirken.

## Approaches

### 1. Statische SVG-Grundkarte mit frei gezeichneten Overlay-Flächen

Visuell schnell, aber fachlich wieder zu schwach. Ohne Koordinatensystem bleiben die Betreiberzonen handplatziert und kaum belastbar. Das ist genau der Modus, den wir ersetzen wollen.

### 2. GeoJSON in WGS84 speichern und im Frontend projektieren

Empfohlen. Deutschland und Bundesländer liegen als echte Geometrien vor. Betreiber werden mit geografischen Ankern und, wo vertretbar, kuratierten Interaktionszonen beschrieben. Die Rendering-Schicht nutzt eine feste Projektion und erzeugt daraus saubere SVG-Pfade. Damit bleibt die Datenbasis georäumlich korrekt, auch wenn einzelne Betreiberflächen zunächst nur regional oder metrisch präzise sind.

### 3. Sofort auf vollständige GIS-Karte mit echten Netzpolygone pro Betreiber warten

Langfristig richtig, kurzfristig nicht sinnvoll. Wir haben noch keine vollständige Polygonabdeckung aller Betreiber. Würden wir darauf warten, bliebe die Seite weiter im Zwischenzustand hängen.

## Decision

Ansatz 2 mit einem Hybridmodell. Die Source-of-Truth für Kartenobjekte ist WGS84-GeoJSON beziehungsweise geografische Koordinaten. Deutschland und Bundesländer kommen als echte Vektorgeometrie, Betreiber erhalten explizite Präzisionsstufen:

- `exact`: echtes Polygon oder präziser Stadt-/Netzraum
- `regional`: kuratierte Zone innerhalb realer Ländergeometrie
- `approximate`: sauber verorteter Hotspot oder Interaktionszone

Damit vermeiden wir Scheingenauigkeit, bekommen aber sofort eine glaubwürdige, skalierbare Kartenbühne.

## Geo Strategy

### Source CRS

Die Daten werden in `EPSG:4326` gespeichert, also Längen- und Breitengrad in WGS84. Das ist konsistent mit RFC 7946 für GeoJSON und kompatibel mit Web-Mapping-Stacks wie MapLibre.

### Render Projection

Für die SVG-Bühne wird die GeoJSON-Geometrie im Frontend mit `d3-geo` projiziert und mit `fitExtent` auf den verfügbaren Kartenraum eingepasst. Für Deutschland reicht eine saubere Länderprojektion auf Basis von WGS84-Daten; die konkrete Projektion wird in der Rendering-Schicht gekapselt, damit wir sie später feinjustieren oder gegen eine GIS-Kartenengine tauschen können.

### Geometry Layers

- Basislayer: echte Deutschland-Silhouette
- Grenzlayer: Bundesländer für räumliche Orientierung
- Betreiberlayer: Interaktionszonen auf Basis geographischer Anker oder kuratierter GeoJSON-Zonen
- Fokuslayer: aktiver Betreiber mit Glow, Kontur und stärkerer Füllung

## Interaction Model

Die Karte bleibt links dominant, rechts steht ein ruhiger Detail-Rail. Die Karte trägt keine Betreibernamen mehr. Stattdessen:

- Hover zeigt Highlight und aktualisiert den Detail-Rail
- Klick oder Tastatur-Fokus fixiert einen Betreiber
- Suche dimmt Nicht-Treffer und hebt Treffer sofort hervor
- Mobile nutzt Tap statt Hover und stapelt den Detail-Rail unter die Karte

Die Interaktionszonen müssen groß genug für Touch bleiben und per Tastatur fokussierbar sein.

## Data Model

Das bisherige kartesische SVG-Modell wird ersetzt durch ein geographisches Modell:

- `baseGeometry`: Deutschland und Bundesländer als GeoJSON-Features in WGS84
- `coverageKind`: `anchor`, `zone`, `polygon`
- `coveragePrecision`: `exact`, `regional`, `approximate`
- `anchor`: `[longitude, latitude]`
- `overlayGeometry`: optionales GeoJSON für kuratierte Betreiberzonen
- `stateHints`: Bundesländer oder Regionen, die der Betreiber primär abdeckt
- `mapPriority`: Zeichen- und Fokusreihenfolge

Die API kann weiterhin `geometry: null` zurückgeben, wenn wir noch keine echten Betreiberpolygone publizieren wollen. Die UI arbeitet dann mit projizierten Overlay-Geometrien aus dem internen View-Model.

## UI Direction

Die Bühne bleibt im Default-Dark-Mode, aber die Karte selbst wird heller und klarer geführt als der Rest des Dashboards:

- fast schwarzer Hintergrund für die Seite
- dunkles Blau-Schiefer für das Kartenpanel
- kühle Grenzlinien für Deutschland und Länder
- aktive Betreiberflächen in klaren Cyan-/Grün-Akzenten
- weichere Schatten und deutlich sichtbare Fokuszustände

Das Detailpanel rechts bleibt informationsdicht, aber nicht laut. Primär sichtbar sind Betreibername, Region, Tarifzusammenfassung, Präzisionsstatus und Quellenpfad.

## Best Practice Notes

- GeoJSON bleibt in WGS84, Projektion erst im Renderer
- SVG-Interaktion ist keyboard-fähig und nicht nur hover-basiert
- Suchfilter dimmt statt entfernt, damit die räumliche Orientierung erhalten bleibt
- Betreiberlabels bleiben aus der Karte heraus, um visuelle Überladung zu vermeiden

## Sources

- RFC 7946 GeoJSON, WGS84 als GeoJSON-Basis: https://www.rfc-editor.org/rfc/rfc7946
- D3 Geo: Projektion und `fitExtent` für SVG-Rendering: https://d3js.org/d3-geo
- MapLibre GeoJSON source model: https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/
- Datawrapper Map Best Practices: https://www.datawrapper.de/blog/choropleth-symbol-maps-easier-faster-better-looking/
- W3C SVG Accessibility: https://www.w3.org/TR/svg-aam-1.0/

## Verification

- View-model-Tests für GeoJSON -> SVG-Projektion
- Komponententests für Hover, Fokus, Klick und Suchfilter
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`
