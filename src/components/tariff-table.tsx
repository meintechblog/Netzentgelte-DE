"use client";

import { type CSSProperties, useState } from "react";

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
    return "ht";
  }

  if (bandKey === "NT") {
    return "nt";
  }

  return "st";
}

function getQuarterSlotClass(
  slot: TariffTableRow["quarterMatrix"][number]["segments"][number]
) {
  if (!slot.bandKey) {
    return "tariff-quarter-segment tariff-quarter-segment--empty";
  }

  return `tariff-quarter-segment tariff-quarter-segment--${getBandAccentClass(slot.bandKey)}`;
}

function getQuarterSlotLabel(
  quarterLabel: string,
  slot: TariffTableRow["quarterMatrix"][number]["segments"][number]
) {
  if (!slot.bandKey || !slot.valueCtPerKwh) {
    return `${quarterLabel} ${slot.timeLabel} · keine Zuordnung`;
  }

  return `${quarterLabel} ${slot.timeLabel} · ${slot.bandKey} · ${slot.valueCtPerKwh} ct/kWh`;
}

const QUARTER_AXIS_MARKS = [
  { label: "00:00", minutes: 0 },
  { label: "04:00", minutes: 4 * 60 },
  { label: "08:00", minutes: 8 * 60 },
  { label: "12:00", minutes: 12 * 60 },
  { label: "16:00", minutes: 16 * 60 },
  { label: "20:00", minutes: 20 * 60 },
  { label: "24:00", minutes: 24 * 60 }
];

function getQuarterSegmentStyle(
  segment: TariffTableRow["quarterMatrix"][number]["segments"][number]
): CSSProperties {
  const top = (segment.startSlotIndex / 96) * 100;
  const height = ((segment.endSlotIndex - segment.startSlotIndex) / 96) * 100;

  return {
    top: `${top}%`,
    height: `${Math.max(height, 1.25)}%`
  };
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
      <div aria-label="Tariffarben" className="tariff-matrix-legend">
        <span className="tariff-matrix-legend__label">Legende</span>
        <span className="tariff-matrix-legend__item tariff-matrix-legend__item--nt">NT</span>
        <span className="tariff-matrix-legend__item tariff-matrix-legend__item--st">ST</span>
        <span className="tariff-matrix-legend__item tariff-matrix-legend__item--ht">HT</span>
      </div>
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
                      <span className="tariff-quarter-card__unit">Blockansicht · 15 Min</span>
                    </div>
                    {quarter.segments.some((segment) => segment.bandKey) ? (
                      <div className="tariff-quarter-blocks">
                        <div aria-hidden="true" className="tariff-quarter-axis">
                          {QUARTER_AXIS_MARKS.map((mark) => (
                            <span
                              className={`tariff-quarter-axis__mark${
                                mark.minutes === 24 * 60 ? " tariff-quarter-axis__mark--end" : ""
                              }`}
                              key={`${quarter.key}-${mark.label}`}
                              style={{ top: `${(mark.minutes / (24 * 60)) * 100}%` }}
                            >
                              {mark.label}
                            </span>
                          ))}
                        </div>
                        <div className="tariff-quarter-rail">
                          {quarter.segments.map((segment) => (
                            <span
                              aria-label={getQuarterSlotLabel(quarter.label, segment)}
                              className={getQuarterSlotClass(segment)}
                              key={`${row.operatorSlug}-${quarter.key}-${segment.startSlotIndex}`}
                              style={getQuarterSegmentStyle(segment)}
                              title={getQuarterSlotLabel(quarter.label, segment)}
                            >
                              {segment.bandKey ? (
                                <>
                                  <span className="tariff-quarter-segment__band">{segment.bandKey}</span>
                                  <span className="tariff-quarter-segment__time">{segment.timeLabel}</span>
                                </>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      </div>
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
