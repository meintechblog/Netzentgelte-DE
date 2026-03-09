import type { TariffTableRow } from "../lib/view-models/tariffs";

type TariffTableProps = {
  rows: TariffTableRow[];
};

function getTimeWindowMeta(row: TariffTableRow) {
  if (row.timeWindows.length === 0) {
    return "Zeitfenster noch nicht strukturiert";
  }

  return `${row.quarterMatrix.length} Quartale`;
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
      <table className="tariff-table">
        <thead>
          <tr>
            <th scope="col">Netzbetreiber</th>
            <th scope="col">Modul 3 aktuell</th>
            <th scope="col">Gültig ab</th>
            <th scope="col">Quelle</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.operatorSlug}>
              <td>
                <div className="table-operator">
                  <strong>{row.operatorName}</strong>
                  <span className="table-muted">{row.regionLabel}</span>
                  <span className="table-muted">{row.operatorSlug}</span>
                </div>
              </td>
              <td>
                <div className="tariff-breakdown">
                  <div className="table-value">{row.currentBandsSummary}</div>
                  <div className="tariff-windows">
                    <div className="tariff-windows__header">
                      <span className="tariff-windows__title">Quartalsmatrix</span>
                      <span className="table-muted">{getTimeWindowMeta(row)}</span>
                    </div>
                    {row.timeWindows.length > 0 ? (
                      <div className="tariff-quarter-grid" role="list" aria-label={`Quartalsmatrix ${row.operatorName}`}>
                        {row.quarterMatrix.map((quarter) => (
                          <section className="tariff-quarter-card" key={`${row.operatorSlug}-${quarter.key}`} role="listitem">
                            <div className="tariff-quarter-card__header">
                              <h3>{quarter.label}</h3>
                              <span className="table-muted">{quarter.summaryLabel}</span>
                            </div>
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
                                      <li className="tariff-window-time" key={`${row.operatorSlug}-${quarter.key}-${group.bandKey}-${timeRange}`}>
                                        {timeRange}
                                      </li>
                                    ))}
                                  </ul>
                                </article>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    ) : (
                      <p className="tariff-window-empty">
                        Die Quelle ist bereits verknüpft, aber die saisonalen oder täglichen
                        Zeitfenster sind noch nicht strukturiert erfasst.
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td>{row.validFrom}</td>
              <td>
                <div className="table-operator">
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
