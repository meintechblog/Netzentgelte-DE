export type NormalizedTariff = {
  modelKey: string;
  validFrom: string;
  valueCentsPerKwh: string;
  sourceUrl: string;
};

export type IngestResult = {
  operatorSlug: string;
  fetchedAt: string;
  tariffs: NormalizedTariff[];
};

export type OperatorAdapter = {
  slug: string;
  run: () => Promise<IngestResult>;
};
