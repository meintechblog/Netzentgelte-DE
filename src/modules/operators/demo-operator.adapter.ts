import type { OperatorAdapter } from "../ingest/contracts";

export const demoOperatorAdapter: OperatorAdapter = {
  slug: "demo-operator",
  async run() {
    return {
      operatorSlug: "demo-operator",
      fetchedAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      tariffs: [
        {
          modelKey: "14a-model-3",
          validFrom: "2026-01-01",
          valueCentsPerKwh: "12.34",
          sourceUrl: "https://example.com/preise.pdf"
        }
      ]
    };
  }
};
