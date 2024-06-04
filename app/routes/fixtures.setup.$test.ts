import { buildFixtureLoader } from '~/ci/helpers';
import { seedCreateBudgetTest } from '~/ci/create-budget';
import { seedCreateGoalTest } from '~/ci/create-goal';

export const loader = buildFixtureLoader({
  'create-budget': seedCreateBudgetTest,
  'create-goal': seedCreateGoalTest,
});
