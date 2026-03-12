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

  if (slot.coverageStatus === "assumed-st" && slot.bandKey === "ST") {
    return "tariff-quarter-segment tariff-quarter-segment--st-assumed";
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

  if (slot.coverageStatus === "assumed-st") {
    return `${quarterLabel} ${slot.timeLabel} · ${slot.bandKey} · ${slot.valueCtPerKwh} ct/kWh · Verifizierte ST-Annahme, da im Originaldokument für dieses Quartal keine Zeitfenster veröffentlicht sind`;
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

function getComplianceStatusLabel(row: TariffTableRow) {
  if (row.compliance.status === "violation") {
    return "Mit Verstößen";
  }

  if (row.compliance.status === "not-evaluable") {
    return "Nicht bewertbar";
  }

  return "Regelkonform";
}

function getComplianceStatusClass(row: TariffTableRow) {
  if (row.compliance.status === "violation") {
    return "review-pill pending";
  }

  if (row.compliance.status === "not-evaluable") {
    return "review-pill review-pill--neutral";
  }

  return "review-pill verified";
}

function renderQuarterCard(
  row: TariffTableRow,
  quarter: TariffTableRow["quarterMatrix"][number],
  variant: "table" | "mobile"
) {
  const suffix = variant === "mobile" ? " mobil" : "";

  return (
    <section
      aria-label={`${row.operatorName} ${quarter.label}${suffix}`}
      className={`tariff-quarter-card ${variant === "table" ? "tariff-quarter-card--table" : "tariff-quarter-card--mobile"}`}
    >
      <div className="tariff-quarter-card__header tariff-quarter-card__header--compact">
        <div className="tariff-quarter-card__copy">
          <span className="tariff-quarter-card__quarter">{quarter.key}</span>
          <span className="table-muted">{quarter.summaryLabel}</span>
        </div>
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
                key={`${quarter.key}-${variant}-${mark.label}`}
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
                key={`${row.operatorSlug}-${quarter.key}-${variant}-${segment.startSlotIndex}`}
                style={getQuarterSegmentStyle(segment)}
                title={getQuarterSlotLabel(quarter.label, segment)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="tariff-window-empty">Keine Zeitfenster erfasst.</p>
      )}
    </section>
  );
}

export function TariffTable({ rows }: TariffTableProps) {
  const [openEndcustomerOperators, setOpenEndcustomerOperators] = useState<Set<string>>(
    () => new Set()
  );

  function getReviewStatusLabel(row: TariffTableRow) {
    return row.reviewStatus === "verified" ? "Geprüft" : "Offen";
  }

  function toggleEndcustomer(operatorSlug: string) {
    setOpenEndcustomerOperators((current) => {
      const next = new Set(current);

      if (next.has(operatorSlug)) {
        next.delete(operatorSlug);
      } else {
        next.add(operatorSlug);
      }

      return next;
    });
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
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Netzbetreiber</th>
            <th scope="col">Q1</th>
            <th scope="col">Q2</th>
            <th scope="col">Q3</th>
            <th scope="col">Q4</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isEndcustomerOpen = openEndcustomerOperators.has(row.operatorSlug);
            const endcustomerPanelId = `${row.operatorSlug}-endcustomer-panel`;

            return (
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
                  <div className="source-review-inline">
                    <span className={`review-pill ${row.reviewStatus}`}>
                      {`Prüfstatus: ${getReviewStatusLabel(row)}`}
                    </span>
                    <span className={getComplianceStatusClass(row)}>
                      {`Regelstatus: ${getComplianceStatusLabel(row)}`}
                    </span>
                    {row.latestPageSnapshotFetchedAt ? (
                      <span className="table-muted">
                        {`Seiten-Snapshot ${row.latestPageSnapshotFetchedAt.slice(0, 10)}`}
                      </span>
                    ) : null}
                    {row.latestDocumentSnapshotFetchedAt ? (
                      <span className="table-muted">
                        {`Dokumenten-Snapshot ${row.latestDocumentSnapshotFetchedAt.slice(0, 10)}`}
                      </span>
                    ) : null}
                    {row.latestPageSnapshotHash ? (
                      <span className="table-muted">{`Seite Hash ${row.latestPageSnapshotHash}`}</span>
                    ) : null}
                    {row.latestDocumentSnapshotHash ? (
                      <span className="table-muted">{`Dokument Hash ${row.latestDocumentSnapshotHash}`}</span>
                    ) : null}
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
                  {row.compliance.violations.length > 0 ? (
                    <section className="operator-compliance-panel" aria-label={`${row.operatorName} Regelverstöße`}>
                      <strong>Abweichungen vom Regelwerk</strong>
                      <ul className="operator-compliance-panel__list">
                        {row.compliance.violations.map((finding) => (
                          <li key={`${row.operatorSlug}-${finding.ruleId}`}>
                            <span className="operator-compliance-panel__title">{finding.title}</span>
                            <span>{finding.message}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  {row.compliance.status === "not-evaluable" && row.compliance.notEvaluated.length > 0 ? (
                    <section className="operator-compliance-panel" aria-label={`${row.operatorName} nicht bewertbare Regeln`}>
                      <strong>Nicht vollständig bewertbar</strong>
                      <ul className="operator-compliance-panel__list">
                        {row.compliance.notEvaluated.map((finding) => (
                          <li key={`${row.operatorSlug}-${finding.ruleId}`}>
                            <span className="operator-compliance-panel__title">{finding.title}</span>
                            <span>{finding.message}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  {row.endcustomerDisplay ? (
                    <section className="tariff-endcustomer-panel">
                      <button
                        aria-controls={endcustomerPanelId}
                        aria-expanded={isEndcustomerOpen}
                        aria-label={`${row.endcustomerDisplay.title} verifiziertes Niederspannungsprodukt ${
                          isEndcustomerOpen ? "Bereich zuklappen" : "Bereich aufklappen"
                        }`}
                        className="tariff-endcustomer-toggle"
                        onClick={() => toggleEndcustomer(row.operatorSlug)}
                        type="button"
                      >
                        <span className="tariff-endcustomer-toggle__copy">
                          <span className="section-eyebrow">{row.endcustomerDisplay.title}</span>
                          <span className="table-muted">verifiziertes Niederspannungsprodukt</span>
                        </span>
                        <span className="tariff-endcustomer-toggle__action" aria-hidden="true">
                          {isEndcustomerOpen ? "Bereich zuklappen" : "Bereich aufklappen"}
                        </span>
                      </button>
                      {isEndcustomerOpen ? (
                        <div className="tariff-endcustomer-grid" id={endcustomerPanelId}>
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
                      ) : null}
                    </section>
                  ) : null}
                  <div className="tariff-quarter-mobile-stack">
                    {row.quarterMatrix.map((quarter) => (
                      <div className="tariff-quarter-mobile-stack__item" key={`${row.operatorSlug}-${quarter.key}-mobile`}>
                        {renderQuarterCard(row, quarter, "mobile")}
                      </div>
                    ))}
                  </div>
                </div>
                </td>
                {row.quarterMatrix.map((quarter) => (
                  <td className="tariff-table__quarter-cell" key={`${row.operatorSlug}-${quarter.key}`}>
                    {renderQuarterCard(row, quarter, "table")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
