import { buildFixtureLoader } from '~/ci/helpers';
import { cleanupCreateBudgetTest } from '~/ci/create-budget';
import { cleanupCreateGoalTest } from '~/ci/create-goal';
import { cleanupCreateSavingsTest } from '~/ci/create-savings';

export const loader = buildFixtureLoader({
  'create-budget': cleanupCreateBudgetTest,
  'create-goal': cleanupCreateGoalTest,
  'create-savings': cleanupCreateSavingsTest,
});
