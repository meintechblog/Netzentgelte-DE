type SourceReviewRow = {
  sourceSlug: string;
  operatorName: string;
  operatorSlug: string;
  checkedAt: string | null;
  latestSnapshotFetchedAt: string | null;
  latestSnapshotHash: string | null;
  pageUrl: string;
  documentUrl: string;
  artifactApiUrl: string | null;
  reviewStatus: string;
};

type SourceReviewTableProps = {
  rows: SourceReviewRow[];
};

export function SourceReviewTable({ rows }: SourceReviewTableProps) {
  return (
    <div className="tariff-table-wrap">
      <table className="tariff-table">
        <thead>
          <tr>
            <th scope="col">Quellenpruefung</th>
            <th scope="col">Letzter Check</th>
            <th scope="col">Artefakt</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sourceSlug}>
              <td>
                <div className="table-operator">
                  <strong>{row.operatorName}</strong>
                  <span className="table-muted">{row.operatorSlug}</span>
                  <span className="table-muted">{row.sourceSlug}</span>
                </div>
              </td>
              <td>
                <div className="table-operator">
                  <span>{row.checkedAt ? `Zuletzt geprueft ${row.checkedAt}` : "Noch nicht geprueft"}</span>
                  <span className="table-muted">
                    {row.latestSnapshotFetchedAt
                      ? `Snapshot ${row.latestSnapshotFetchedAt.slice(0, 10)}`
                      : "Noch kein Snapshot"}
                  </span>
                  <span className="table-muted">
                    {row.latestSnapshotHash ? `Hash ${row.latestSnapshotHash}` : "Hash ausstehend"}
                  </span>
                </div>
              </td>
              <td>
                <div className="table-operator">
                  <a className="source-link" href={row.pageUrl} rel="noreferrer" target="_blank">
                    Quellseite
                  </a>
                  <a className="source-link" href={row.documentUrl} rel="noreferrer" target="_blank">
                    Originaldokument
                  </a>
                  {row.artifactApiUrl ? (
                    <a className="source-link" href={row.artifactApiUrl} rel="noreferrer" target="_blank">
                      Gespeichertes Artefakt
                    </a>
                  ) : (
                    <span className="table-muted">Noch kein gespeichertes Artefakt</span>
                  )}
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
