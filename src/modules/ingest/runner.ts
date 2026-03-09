import type { OperatorAdapter } from "./contracts";

import { demoOperatorAdapter } from "../operators/demo-operator.adapter";

const adapterRegistry: Record<string, OperatorAdapter> = {
  [demoOperatorAdapter.slug]: demoOperatorAdapter
};

export async function runIngest(operatorSlug: string) {
  const adapter = adapterRegistry[operatorSlug];

  if (!adapter) {
    throw new Error(`No operator adapter registered for ${operatorSlug}.`);
  }

  return adapter.run();
}
