import { cleanupCreateBudgetTest } from '~/ci/create-budget';
import { buildFixtureLoader } from '~/ci/helpers';

export const loader = buildFixtureLoader({
  'create-budget': cleanupCreateBudgetTest,
});
