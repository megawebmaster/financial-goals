import { buildFixtureLoader } from '~/ci/helpers';
import { cleanupCreateBudgetTest } from '~/ci/create-budget';
import { cleanupCreateGoalTest } from '~/ci/create-goal';

export const loader = buildFixtureLoader({
  'create-budget': cleanupCreateBudgetTest,
  'create-goal': cleanupCreateGoalTest,
});
