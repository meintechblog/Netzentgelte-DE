import type { TariffTableRow } from "../lib/view-models/tariffs";

type TariffTableProps = {
  rows: TariffTableRow[];
};

export function TariffTable({ rows }: TariffTableProps) {
  return (
    <div className="tariff-table-wrap">
      <table className="tariff-table">
        <thead>
          <tr>
            <th scope="col">Netzbetreiber</th>
            <th scope="col">Modul 3 aktuell</th>
            <th scope="col">Gueltig ab</th>
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
                  <span className="table-muted">{row.operatorSlug}</span>
                </div>
              </td>
              <td className="table-value">{row.currentBandsSummary}</td>
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
                </div>
              </td>
              <td>
                <span className={`review-pill ${row.reviewStatus}`}>
                  {row.reviewStatus === "verified" ? "Geprueft" : "Offen"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
