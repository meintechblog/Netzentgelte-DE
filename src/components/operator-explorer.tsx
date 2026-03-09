"use client";

import { useDeferredValue, useId, useState } from "react";

import type { OperatorMapFeature } from "../lib/maps/geojson";
import type { TariffTableRow } from "../lib/view-models/tariffs";
import { OperatorMap } from "./operator-map";
import { TariffTable } from "./tariff-table";

type OperatorExplorerProps = {
  rows: TariffTableRow[];
  mapFeatures: OperatorMapFeature[];
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

export function OperatorExplorer({ rows, mapFeatures }: OperatorExplorerProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const searchId = useId();

  const filteredRows =
    deferredQuery.length === 0
      ? rows
      : rows.filter((row) =>
          matchesSearch(
            buildSearchIndex([row.operatorName, row.operatorSlug, row.regionLabel]),
            deferredQuery
          )
        );

  const filteredMapFeatures =
    deferredQuery.length === 0
      ? mapFeatures
      : mapFeatures.filter((feature) =>
          matchesSearch(
            buildSearchIndex([feature.operatorName, feature.id, feature.regionLabel]),
            deferredQuery
          )
        );

  return (
    <>
      <section className="content-panel" aria-labelledby="betreibersuche">
        <div className="panel-header search-panel">
          <div>
            <span className="section-eyebrow">Live-Filter</span>
            <h2 id="betreibersuche">Netzbetreiber suchen</h2>
            <p>
              Filtert Karte und Tarifmatrix direkt beim Tippen nach Betreibername, Kürzel
              oder Region.
            </p>
          </div>
          <div className="panel-actions">
            <span className="surface-chip">{getResultLabel(filteredRows.length)}</span>
            <span className="surface-chip">Live während des Tippens</span>
          </div>
        </div>
        <div className="operator-search">
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
        </div>
      </section>

      <section className="content-panel" aria-labelledby="kartenstufe">
        <div className="panel-header">
          <div>
            <span className="section-eyebrow">Räumliche Lesart</span>
            <h2 id="kartenstufe">Interaktive Netzgebiets-Stufe</h2>
            <p>
              Die Geometrie ist noch abstrakt, die Betreiber- und Quellenebene ist jetzt
              jedoch bereits echt und reviewbar.
            </p>
          </div>
          <div className="panel-actions">
            <span className="surface-chip">Map hover</span>
            <span className="surface-chip">Source trace</span>
          </div>
        </div>
        <OperatorMap features={filteredMapFeatures} />
      </section>

      <section className="content-panel" aria-labelledby="tarifmatrix" id="tarifmatrix">
        <div className="panel-header">
          <div>
            <span className="section-eyebrow">Nachvollziehbare Daten</span>
            <h2>Aktuelle Tarifmatrix</h2>
            <p>
              Jeder Eintrag führt zur Betreiberseite, zum Dokument und zeigt offen, ob die
              Bandwerte bereits sauber kuratiert sind.
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
