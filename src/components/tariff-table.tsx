import type { TariffTableRow } from "../lib/view-models/tariffs";

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
