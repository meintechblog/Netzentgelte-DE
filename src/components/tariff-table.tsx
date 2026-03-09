"use client";

import { useState } from "react";

import type { EndcustomerDisplayProduct, TariffTableRow } from "../lib/view-models/tariffs";

type TariffTableProps = {
  rows: TariffTableRow[];
};

function getBandBadges(row: TariffTableRow) {
  if (row.currentBandBadges?.length) {
    return row.currentBandBadges;
  }

  return [...row.currentBandsSummary.matchAll(/\b(NT|ST|HT)\s+(\d+(?:\.\d+)?)/g)].map((match) => ({
    key: match[1] as "NT" | "ST" | "HT",
    valueCtPerKwh: match[2]!
  }));
}

function getBandAccentClass(bandKey: "NT" | "ST" | "HT") {
  if (bandKey === "HT") {
    return "tariff-quarter-band--high";
  }

  if (bandKey === "NT") {
    return "tariff-quarter-band--low";
  }

  return "tariff-quarter-band--standard";
}

function getEndcustomerProductAccent(productKey: EndcustomerDisplayProduct["key"]) {
  if (productKey === "modul-3") {
    return "tariff-endcustomer-card--modul-3";
  }

  if (productKey === "messung") {
    return "tariff-endcustomer-card--messung";
  }

  return "tariff-endcustomer-card--base";
}

export function TariffTable({ rows }: TariffTableProps) {
  const [expandedSourceSlugs, setExpandedSourceSlugs] = useState<Record<string, boolean>>({});

  function toggleSourceDetails(operatorSlug: string) {
    setExpandedSourceSlugs((current) => ({
      ...current,
      [operatorSlug]: !current[operatorSlug]
    }));
  }

  return (
    <div className="tariff-table-wrap">
      <table className="tariff-table tariff-table--quarterly">
        <colgroup>
          <col className="tariff-table__col-operator" />
          <col className="tariff-table__col-quarter" />
          <col className="tariff-table__col-quarter" />
          <col className="tariff-table__col-quarter" />
          <col className="tariff-table__col-quarter" />
          <col className="tariff-table__col-review" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Netzbetreiber</th>
            <th scope="col">Q1</th>
            <th scope="col">Q2</th>
            <th scope="col">Q3</th>
            <th scope="col">Q4</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.operatorSlug}>
              <td>
                <div className="table-operator tariff-operator-meta">
                  <strong>{row.operatorName}</strong>
                  <span className="table-muted">{row.regionLabel}</span>
                  <span className="table-muted">{row.operatorSlug}</span>
                  <div aria-label="Arbeitspreise in ct/kWh" className="tariff-band-badges">
                    {getBandBadges(row).map((band) => (
                      <span className={`tariff-band-badge tariff-band-badge--${band.key.toLowerCase()}`} key={band.key}>
                        <span className="tariff-band-badge__key">{band.key}</span>
                        <span className="tariff-band-badge__value">{band.valueCtPerKwh}</span>
                      </span>
                    ))}
                  </div>
                  <span className="table-muted">{`Gültig ab ${row.validFrom}`}</span>
                  <a
                    className="source-link"
                    href={row.sourcePageUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Quellseite
                  </a>
                  <a
                    className="source-link"
                    href={row.documentUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    PDF / Dokument
                  </a>
                  <span className="table-muted">
                    {row.checkedAt ? `Zuletzt geprüft ${row.checkedAt}` : "Noch nicht geprüft"}
                  </span>
                  <span className="table-muted">{`Quelle ${row.sourceSlug}`}</span>
                  {row.endcustomerDisplay ? (
                    <section
                      aria-label={`${row.operatorName} ${row.endcustomerDisplay.title}`}
                      className="tariff-endcustomer-panel"
                    >
                      <div className="tariff-endcustomer-panel__header">
                        <span className="section-eyebrow">{row.endcustomerDisplay.title}</span>
                        <span className="table-muted">verifiziertes Niederspannungsprodukt</span>
                      </div>
                      <div className="tariff-endcustomer-grid">
                        {row.endcustomerDisplay.products.map((product) => (
                          <article
                            className={`tariff-endcustomer-card ${getEndcustomerProductAccent(product.key)}`}
                            key={`${row.operatorSlug}-${product.key}`}
                          >
                            <h3>{product.label}</h3>
                            <dl className="tariff-endcustomer-metrics">
                              {product.metrics.map((metric) => (
                                <div key={`${row.operatorSlug}-${product.key}-${metric.label}`}>
                                  <dt>{metric.label}</dt>
                                  <dd>{metric.value}</dd>
                                </div>
                              ))}
                            </dl>
                            {product.requirementBadges.length > 0 ? (
                              <div className="tariff-endcustomer-badges">
                                {product.requirementBadges.map((badge) => (
                                  <span
                                    className="tariff-endcustomer-badge"
                                    key={`${row.operatorSlug}-${product.key}-${badge}`}
                                  >
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  <button
                    aria-controls={`source-details-${row.operatorSlug}`}
                    aria-expanded={expandedSourceSlugs[row.operatorSlug] ? "true" : "false"}
                    className="source-details-toggle"
                    onClick={() => toggleSourceDetails(row.operatorSlug)}
                    type="button"
                  >
                    {expandedSourceSlugs[row.operatorSlug]
                      ? "Quelle & Prüfstatus ausblenden"
                      : "Quelle & Prüfstatus anzeigen"}
                  </button>
                  {expandedSourceSlugs[row.operatorSlug] ? (
                    <section
                      className="source-details-panel"
                      id={`source-details-${row.operatorSlug}`}
                    >
                      <div className="source-details-panel__header">
                        <span className={`review-pill ${row.reviewStatus}`}>
                          {row.reviewStatus === "verified" ? "Geprüft" : "Offen"}
                        </span>
                        {row.sourceHealthReport ? (
                          <span
                            className={`surface-chip source-health-chip source-health-chip--${row.sourceHealthReport.status}`}
                          >
                            {row.sourceHealthReport.status === "ok"
                              ? "Quelle stabil"
                              : row.sourceHealthReport.status === "blocked"
                                ? "Quelle blockiert"
                                : "Quelle prüfen"}
                          </span>
                        ) : null}
                      </div>
                      <div className="source-details-grid">
                        <span className="table-muted">
                          {row.latestPageSnapshotFetchedAt
                            ? `Seiten-Snapshot ${row.latestPageSnapshotFetchedAt.slice(0, 10)}`
                            : "Seiten-Snapshot ausstehend"}
                        </span>
                        <span className="table-muted">
                          {row.latestDocumentSnapshotFetchedAt
                            ? `Dokumenten-Snapshot ${row.latestDocumentSnapshotFetchedAt.slice(0, 10)}`
                            : "Dokumenten-Snapshot ausstehend"}
                        </span>
                        {row.latestPageSnapshotHash ? (
                          <span className="table-muted">{`Seite Hash ${row.latestPageSnapshotHash}`}</span>
                        ) : null}
                        {row.latestDocumentSnapshotHash ? (
                          <span className="table-muted">{`Dokument Hash ${row.latestDocumentSnapshotHash}`}</span>
                        ) : null}
                      </div>
                      <div className="source-details-links">
                        <a
                          className="source-link"
                          href={row.sourcePageUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Quellseite
                        </a>
                        <a
                          className="source-link"
                          href={row.documentUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Originaldokument
                        </a>
                        {row.pageArtifactApiUrl ? (
                          <a
                            className="source-link"
                            href={row.pageArtifactApiUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Gespeicherte Quellseite
                          </a>
                        ) : null}
                        {row.documentArtifactApiUrl ? (
                          <a
                            className="source-link"
                            href={row.documentArtifactApiUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Gespeichertes Dokument
                          </a>
                        ) : null}
                      </div>
                      {row.sourceHealthReport?.issues.length ? (
                        <ul className="source-health-issues">
                          {row.sourceHealthReport.issues.map((issue) => (
                            <li key={`${row.operatorSlug}-${issue.key}`}>{issue.message}</li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ) : null}
                </div>
              </td>
              {row.quarterMatrix.map((quarter) => (
                <td key={`${row.operatorSlug}-${quarter.key}`}>
                  <section
                    aria-label={`${row.operatorName} ${quarter.label}`}
                    className="tariff-quarter-card tariff-quarter-card--table"
                  >
                    <div className="tariff-quarter-card__header tariff-quarter-card__header--compact">
                      <span className="table-muted">{quarter.summaryLabel}</span>
                      <span className="tariff-quarter-card__unit">ct/kWh</span>
                    </div>
                    {quarter.timelineEntries.length > 0 ? (
                      <ol className="tariff-quarter-timeline">
                        {quarter.timelineEntries.map((entry) => (
                          <li
                            className={`tariff-quarter-entry ${getBandAccentClass(entry.bandKey)}`}
                            key={`${row.operatorSlug}-${quarter.key}-${entry.bandKey}-${entry.timeRange}`}
                          >
                            <span className="tariff-window-time">{entry.timeRange}</span>
                            <span className="tariff-window-chip">{entry.bandKey}</span>
                            <strong className="tariff-quarter-entry__price">{entry.valueCtPerKwh}</strong>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="tariff-window-empty">Keine Tariffenster erfasst.</p>
                    )}
                  </section>
                </td>
              ))}
              <td>
                <span className={`review-pill ${row.reviewStatus}`}>
                  {row.reviewStatus === "verified" ? "Geprüft" : "Offen"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
