import {
  getPublicationIntegrityReport,
  type PublicationIntegrityOperator
} from "./publication-integrity";

export type VerifiedOperatorWorkflowResult =
  | {
      ok: true;
      operator: PublicationIntegrityOperator;
      report: ReturnType<typeof getPublicationIntegrityReport>;
    }
  | {
      ok: false;
      failedCheckKeys: ReturnType<typeof getPublicationIntegrityReport>["failedCheckKeys"];
      report: ReturnType<typeof getPublicationIntegrityReport>;
    };

export function buildVerifiedOperatorPayload(
  input: PublicationIntegrityOperator
): VerifiedOperatorWorkflowResult {
  const operator: PublicationIntegrityOperator = {
    ...input,
    reviewStatus: "verified"
  };
  const report = getPublicationIntegrityReport(operator);

  if (!report.publishable) {
    return {
      ok: false,
      failedCheckKeys: report.failedCheckKeys,
      report
    };
  }

  return {
    ok: true,
    operator,
    report
  };
}
