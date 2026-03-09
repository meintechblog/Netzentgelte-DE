# Germany Map Design

## Goal

Die Deutschlandkarte soll von einem abstrakten Platzhalter zu einem praeganten Hero-Modul werden, das Netzbetreiber massstabsgetreu und fachlich nachvollziehbar auf der Startseite verortet. Karte, Suche, Tarifmatrix und Detailansicht muessen dabei auf derselben Datenbasis aufsetzen.

## Approaches

### 1. Punkt- oder Bubble-Karte

Schnell umsetzbar, aber fachlich zu schwach. Netzbetreiber erscheinen nur als Marker, nicht als Netzgebiete. Fuer ein Produkt, das sich um Netzabdeckung und regionale Tarife dreht, waere das nur ein aufgehuebschter Platzhalter.

### 2. Hero-Karte mit kuratierten Geometrien und klaren Praezisionsstufen

Empfohlen. Die Startseite beginnt mit einer grossen Deutschlandkarte. Betreiber werden ueber echte oder kuratierte Gebietsgeometrien dargestellt. Wo noch keine belastbare Polygonquelle vorliegt, wird ein bewusst markierter Fallback mit definierter Praezision verwendet, etwa Bundeslandflaeche, Metro-Area oder Label-Anchor.

### 3. Warten auf vollstaendige amtliche Netzpolygone

Fachlich attraktiv, operativ aber falsch. Die UI bliebe bis zur vollstaendigen Polygonabdeckung weiter im Platzhaltermodus. Das schuetzt zwar vor Zwischenloesungen, blockiert aber sichtbaren Produktfortschritt.

## Decision

Ansatz 2. Wir bauen jetzt eine dominante Hero-Karte mit kuratierten Betreiberflaechen, die spaeter auf echte Netzgebietsgeometrien migriert werden kann. Der Nutzer bekommt sofort eine deutlich bessere raeumliche Lesart, waehrend das System technisch sauber zwischen echter Geometrie und Fallback-Praezision unterscheidet.

## Experience

Die Startseite beginnt mit einer grossen Deutschlandkarte, nicht mehr mit der bisherigen kleinen Karten-Section. Im Hero-Bereich stehen Karte und Detailpanel im Mittelpunkt, die bestehende Suchfunktion sitzt direkt an der Karte und filtert alle sichtbaren Betreiber waehrend des Tippens.

Die Karte selbst zeigt Deutschland als klare Grundflaeche mit farblich differenzierten Betreibergebieten. Hover und Fokus heben einen Betreiber hervor, ein Klick fixiert ihn im Detailpanel. Das Detailpanel zeigt Name, Region, Tarifzusammenfassung, Zeitfenster, Review-Status und direkte Links zu Quellseite und Dokument. Unterhalb der Hero-Karte folgen Tarifmatrix und Quellenpruefung als sekundaire Arbeitsmodi.

## Data Model

Die bisherige `OperatorMapFeature`-Struktur reicht dafuer nicht aus. Wir brauchen kartenspezifische Attribute, damit Geometriequalitaet, Beschriftung und Priorisierung klar bleiben:

- `coverageType`: `polygon`, `state`, `metro`, `point-fallback`
- `geometryPrecision`: `exact`, `regional`, `approximate`
- `mapLabel`: explizite Kurzbeschriftung fuer die Karte
- `mapRank`: Priorisierung fuer Zeichnungs- und Label-Reihenfolge
- `labelAnchor`: kartesischer Ankerpunkt fuer Labels oder Marker
- `centroid`: Mittelpunkt fuer Hitboxen und Fokuszustand
- optionale Herkunftsfelder wie `geometrySourceLabel` und `geometrySourceKind`

Das bestehende Datenbankschema `operator_geometries` bleibt die Persistenzbasis. Fuer den ersten UI-Slice koennen die kuratierten Geometrien noch aus einer lokalen Seed-Datei kommen, solange die Struktur spaeter ohne Brechung in PostGIS ueberfuehrbar ist.

## Map Strategy

Deutschland wird als SVG-basierte Hero-Karte umgesetzt. Das vermeidet fruehzeitig eine schwere Mapping-Library, erlaubt aber trotzdem massstabsgetreue Platzierung, Hover-Zustaende, Layering und responsives Verhalten. Fuer diesen Slice reicht eine kuratierte Basiskarte mit Betreiberflaechen oder Fallback-Regionen.

Betreiber mit heute schon belastbarer regionaler Einordnung bekommen eine sichtbare Flaeche oder ein sauberes Regionalpolygon. Betreiber ohne exakte Flaeche erhalten einen transparent markierten Fallback. Diese Unterscheidung muss sowohl technisch als auch im UI sichtbar sein, damit wir keine Scheingenauigkeit anzeigen.

## Scope

- Hero-Kartenlayout auf der Startseite
- neue SVG-basierte Deutschlandkarte mit Highlight-, Hover- und Fokuszustand
- erweitertes Map-Feature-Modell mit Label- und Praezisionsattributen
- kuratierter Geo-Slice fuer die aktuell vorhandenen Betreiber
- Suchintegration fuer Karte, Detailpanel und Tarifmatrix
- Tests fuer Kartenrendering, Filterung und Fallback-Geometrien

## Out of Scope

- vollstaendige deutschlandweite Polygonabdeckung aller Netzgebiete
- Zoom/Pan/Gesten wie in einer vollwertigen GIS-Karte
- geographische Nutzereingabe per Adresse oder Postleitzahl
- automatische Geometrieableitung aus externen Registern im selben Slice

## Verification

- `pnpm vitest run src/components/operator-map.test.tsx src/components/operator-explorer.test.tsx src/app/page.test.tsx`
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`
