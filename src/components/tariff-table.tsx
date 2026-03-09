import type { TariffTableRow } from "../lib/view-models/tariffs";

type TariffTableProps = {
  rows: TariffTableRow[];
};

function getBandAccentClass(bandKey: "NT" | "ST" | "HT") {
  if (bandKey === "HT") {
    return "tariff-quarter-band--high";
  }

  if (bandKey === "NT") {
    return "tariff-quarter-band--low";
  }

  return "tariff-quarter-band--standard";
}

function getBandDisplayLabel(bandKey: "NT" | "ST" | "HT") {
  if (bandKey === "HT") {
    return "Hochtarif";
  }

  if (bandKey === "NT") {
    return "Niedrigtarif";
  }

  return "Standardtarif";
}

export function TariffTable({ rows }: TariffTableProps) {
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
                  <div className="table-value">{row.currentBandsSummary}</div>
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
                    </div>
                    {quarter.groups.length > 0 ? (
                      <div className="tariff-quarter-band-list">
                        {quarter.groups.map((group) => (
                          <article
                            className={`tariff-quarter-band ${getBandAccentClass(group.bandKey)}`}
                            key={`${row.operatorSlug}-${quarter.key}-${group.bandKey}`}
                          >
                            <div className="tariff-quarter-band__header">
                              <div className="tariff-quarter-band__title">
                                <span className="tariff-window-chip">{getBandDisplayLabel(group.bandKey)}</span>
                                <span className="tariff-quarter-band__source-label">{group.label}</span>
                              </div>
                              <strong className="tariff-quarter-band__price">{`${group.valueCtPerKwh} ct/kWh`}</strong>
                            </div>
                            <ul className="tariff-quarter-band__times">
                              {group.timeRanges.map((timeRange) => (
                                <li
                                  className="tariff-window-time"
                                  key={`${row.operatorSlug}-${quarter.key}-${group.bandKey}-${timeRange}`}
                                >
                                  {timeRange}
                                </li>
                              ))}
                            </ul>
                          </article>
                        ))}
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
