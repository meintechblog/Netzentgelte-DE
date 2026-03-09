"use client";

import { useDeferredValue, useId, useState } from "react";

import type { ProjectedGermanyMapScene } from "../lib/maps/geojson";
import type { TariffTableRow } from "../lib/view-models/tariffs";
import { OperatorMap } from "./operator-map";
import { TariffTable } from "./tariff-table";

type OperatorExplorerProps = {
  rows: TariffTableRow[];
  mapScene: ProjectedGermanyMapScene;
};

function normalizeSearchValue(value: string) {
  return value
    .toLocaleLowerCase("de-DE")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function buildAlternateGermanSpelling(value: string) {
  return value
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function buildSearchIndex(parts: string[]) {
  return parts
    .flatMap((part) => [part, normalizeSearchValue(part), buildAlternateGermanSpelling(part)])
    .join(" ");
}

function matchesSearch(index: string, query: string) {
  const candidates = [query, normalizeSearchValue(query), buildAlternateGermanSpelling(query)];
  return candidates.some((candidate) => index.includes(candidate));
}

function getResultLabel(count: number) {
  return count === 1 ? "1 Treffer" : `${count} Treffer`;
}

export function OperatorExplorer({ rows, mapScene }: OperatorExplorerProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const searchId = useId();

  const filteredRows =
    deferredQuery.length === 0
      ? rows
      : rows.filter((row) =>
          matchesSearch(
            buildSearchIndex([
              row.operatorName,
              row.operatorSlug,
              row.regionLabel,
              row.sourceSlug,
              row.sourcePageUrl,
              row.documentUrl,
              row.endcustomerDisplay?.title ?? "",
              row.endcustomerDisplay?.searchText ?? "",
              ...(row.sourceHealthReport?.issues.map((issue) => issue.message) ?? [])
            ]),
            deferredQuery
          )
        );

  const filteredMapScene = {
    ...mapScene,
    operators: mapScene.operators.map((feature) => ({
      ...feature,
      searchMatch:
        deferredQuery.length === 0
          ? true
          : matchesSearch(
              buildSearchIndex([feature.operatorName, feature.id, feature.regionLabel]),
              deferredQuery
            )
    }))
  };

  return (
    <>
      <section className="content-panel map-hero-panel" aria-labelledby="kartenstufe">
        <div className="panel-header map-hero-panel__header">
          <div>
            <span className="section-eyebrow">Hero-Karte</span>
            <h2 id="kartenstufe">Deutschlandkarte im Fokus</h2>
            <p>
              Amtliche Deutschland- und Gemeindegeometrie, belegte Netzgebiete und
              Tarifkontext auf einer gemeinsamen Kartenbühne.
            </p>
          </div>
          <div className="panel-actions">
            <span className="surface-chip">GeoJSON · WGS84</span>
            <span className="surface-chip">{getResultLabel(filteredRows.length)}</span>
            <span className="surface-chip">{mapScene.mappedOperatorCount} Flächen belegt</span>
            <span className="surface-chip">Live während des Tippens</span>
          </div>
        </div>
        <div className="operator-search operator-search--hero">
          <label className="operator-search__label" htmlFor={searchId}>
            Suchbegriff
          </label>
          <div className="operator-search__field">
            <input
              id={searchId}
              className="operator-search__input"
              name="operator-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="z. B. Berlin, Westnetz oder Schwäbisch Hall"
              type="search"
              value={query}
            />
            {query.length > 0 ? (
              <button className="operator-search__clear" onClick={() => setQuery("")} type="button">
                Zurücksetzen
              </button>
            ) : null}
          </div>
          <p className="operator-search__hint">
            Filtert den gesamten Betreiberbereich mitsamt integrierten Quelleninfos.
            Die Karte dimmt weiterhin nach Betreibername, Slug oder Region.
          </p>
        </div>
        <OperatorMap scene={filteredMapScene} />
      </section>

      <section className="content-panel" aria-labelledby="tarifmatrix" id="tarifmatrix">
        <div className="panel-header">
          <div>
            <span className="section-eyebrow">Nachvollziehbare Daten</span>
            <h2>Netzbetreiber & Tarifdaten</h2>
            <p>
              Tarifmatrix, Quellenpfad und Prüfstatus stehen je Betreiber in einem
              gemeinsamen Eintrag.
            </p>
          </div>
          <div className="panel-actions">
            <span className="surface-chip">Zeitfenster</span>
            <span className="surface-chip">Dark mode · WCAG AA</span>
            <span className="surface-chip">Blue / Amber Dashboard</span>
          </div>
        </div>
        {filteredRows.length > 0 ? (
          <TariffTable rows={filteredRows} />
        ) : (
          <div className="tariff-empty-state">
            <h3>Kein Netzbetreiber passt zur aktuellen Suche.</h3>
            <p>
              Passe den Begriff an oder setze den Filter zurück, um wieder alle Betreiber zu
              sehen.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
