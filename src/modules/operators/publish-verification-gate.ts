export type PublishVerificationSnapshot = {
  operatorCount: number;
  operators: Array<{ operatorSlug?: string; slug?: string }>;
  pendingOperators: {
    summary: {
      operatorCount: number;
      sourceFoundCount: number;
      tariffReadyCount: number;
    };
    items: Array<{ slug: string }>;
  };
};

export function verifyPublishedOperatorInSnapshot(input: {
  expectedSlug: string;
  snapshot: PublishVerificationSnapshot;
}) {
  const published = input.snapshot.operators.some(
    (operator) => operator.operatorSlug === input.expectedSlug || operator.slug === input.expectedSlug
  );

  if (published) {
    return {
      passed: true,
      reason: null
    };
  }

  const pending = input.snapshot.pendingOperators.items.some((operator) => operator.slug === input.expectedSlug);

  if (pending) {
    return {
      passed: false,
      reason: `Operator ${input.expectedSlug} is still only present in pending.`
    };
  }

  return {
    passed: false,
    reason: `Operator ${input.expectedSlug} is missing from the public snapshot.`
  };
}
