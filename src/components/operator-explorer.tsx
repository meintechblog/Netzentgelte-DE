"use client";

import { useDeferredValue, useId, useState } from "react";

import type { ProjectedGermanyMapScene } from "../lib/maps/geojson";
import type { ComplianceRuleSetDisplay, TariffTableRow } from "../lib/view-models/tariffs";
import { OperatorMap } from "./operator-map";
import { TariffTable } from "./tariff-table";

type OperatorExplorerProps = {
  rows: TariffTableRow[];
  mapScene: ProjectedGermanyMapScene;
  complianceRuleSet: ComplianceRuleSetDisplay;
};

type ComplianceFilter = "all" | "compliant" | "violation" | "not-evaluable";

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

function getComplianceFilterLabel(filter: ComplianceFilter) {
  switch (filter) {
    case "compliant":
      return "Regelkonform";
    case "violation":
      return "Mit Verstößen";
    case "not-evaluable":
      return "Nicht bewertbar";
    default:
      return "Alle";
  }
}

function matchesComplianceFilter(row: TariffTableRow, filter: ComplianceFilter) {
  return filter === "all" ? true : row.compliance.status === filter;
}

export function OperatorExplorer({ rows, mapScene, complianceRuleSet }: OperatorExplorerProps) {
  const [query, setQuery] = useState("");
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>("all");
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const deferredQuery = useDeferredValue(query.trim());
  const searchId = useId();
  const compliancePanelId = useId();

  const searchFilteredRows = rows.filter((row) => {
    if (deferredQuery.length === 0) {
      return true;
    }

    return matchesSearch(
      buildSearchIndex([
        row.operatorName,
        row.operatorSlug,
        row.regionLabel,
        row.sourceSlug,
        row.sourcePageUrl ?? "",
        row.documentUrl ?? "",
        row.reviewStatus,
        row.publicationStatus ?? "",
        row.statusSummary ?? "",
        ...(row.missingInformation ?? []),
        row.priceBasisLabel,
        row.compliance.status,
        ...row.compliance.violations.flatMap((finding) => [finding.ruleId, finding.title, finding.message]),
        ...row.compliance.notEvaluated.flatMap((finding) => [
          finding.ruleId,
          finding.title,
          finding.message
        ]),
        row.endcustomerDisplay?.title ?? "",
        row.endcustomerDisplay?.searchText ?? "",
        ...(row.sourceHealthReport?.issues.map((issue) => issue.message) ?? [])
      ]),
      deferredQuery
    );
  });
  const complianceCounts: Record<ComplianceFilter, number> = {
    all: searchFilteredRows.length,
    compliant: searchFilteredRows.filter((row) => row.compliance.status === "compliant").length,
    violation: searchFilteredRows.filter((row) => row.compliance.status === "violation").length,
    "not-evaluable": searchFilteredRows.filter((row) => row.compliance.status === "not-evaluable").length
  };
  const filteredRows = searchFilteredRows.filter((row) => matchesComplianceFilter(row, complianceFilter));
  const visibleOperatorSlugs = new Set(filteredRows.map((row) => row.operatorSlug));

  const filteredMapScene = {
    ...mapScene,
    operators: mapScene.operators.map((feature) => ({
      ...feature,
      searchMatch:
        visibleOperatorSlugs.size === 0
          ? false
          : visibleOperatorSlugs.has(feature.id) &&
            (deferredQuery.length === 0 ||
              matchesSearch(
                buildSearchIndex([feature.operatorName, feature.id, feature.regionLabel]),
                deferredQuery
              ))
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
              Tarifmatrix, Quellenpfad, Prüfstatus und Regelkonformität stehen je Betreiber in
              einem gemeinsamen Eintrag.
            </p>
          </div>
          <div className="panel-actions">
            <span className="surface-chip">Zeitfenster</span>
            <span className="surface-chip">{getComplianceFilterLabel(complianceFilter)}</span>
            <span className="surface-chip">Dark mode · WCAG AA</span>
            <span className="surface-chip">Blue / Amber Dashboard</span>
          </div>
        </div>
        <section className="compliance-rule-set" aria-labelledby="modul-3-regeln">
          <div className="compliance-rule-set__header">
            <div>
              <span className="section-eyebrow">Regelwerk</span>
              <h3 id="modul-3-regeln">{`${complianceRuleSet.title} ${complianceRuleSet.version}`}</h3>
              {isComplianceOpen ? (
                <p>
                  Strukturierte Modul-3-Regeln aus der BDEW-Anwendungshilfe als Filter- und
                  Prüfgrundlage.
                </p>
              ) : null}
            </div>
            <div className="compliance-rule-set__actions">
              {isComplianceOpen ? (
                <a
                  className="source-link"
                  href={complianceRuleSet.sourceDocumentUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {complianceRuleSet.sourceDocumentLabel}
                </a>
              ) : null}
              <button
                aria-controls={compliancePanelId}
                aria-expanded={isComplianceOpen}
                className="compliance-rule-set__toggle"
                onClick={() => setIsComplianceOpen((current) => !current)}
                type="button"
              >
                {isComplianceOpen ? "Regelwerk zuklappen" : "Regelwerk aufklappen"}
              </button>
            </div>
          </div>
          {isComplianceOpen ? (
            <div className="compliance-rule-set__panel" id={compliancePanelId}>
              <ul className="compliance-rule-set__list">
                {complianceRuleSet.rules.map((rule) => (
                  <li className="compliance-rule-set__item" key={rule.ruleId}>
                    <strong>{rule.title}</strong>
                    <span>{rule.description}</span>
                    <span className="table-muted">{rule.sourceCitation}</span>
                  </li>
                ))}
              </ul>
              <div className="compliance-filter" aria-label="Compliance-Filter">
                {(["all", "compliant", "violation", "not-evaluable"] as const).map((filter) => (
                  <button
                    aria-pressed={complianceFilter === filter}
                    className={`compliance-filter__button${
                      complianceFilter === filter ? " compliance-filter__button--active" : ""
                    }`}
                    key={filter}
                    onClick={() => setComplianceFilter(filter)}
                    type="button"
                  >
                    {`${getComplianceFilterLabel(filter)} (${complianceCounts[filter]})`}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>
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
