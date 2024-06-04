import { buildFixtureLoader } from '~/ci/helpers';
import { seedCreateBudgetTest } from '~/ci/create-budget';
import { seedCreateGoalTest } from '~/ci/create-goal';
import { seedCreateSavingsTest } from '~/ci/create-savings';
import { seedEditGoalTest } from '~/ci/edit-goal';
import { seedRemoveGoalTest } from '~/ci/remove-goal';
import { seedRemoveGoalWithSavingsTest } from '~/ci/remove-goal-with-savings';

export const loader = buildFixtureLoader({
  'create-budget': seedCreateBudgetTest,
  'create-goal': seedCreateGoalTest,
  'create-savings': seedCreateSavingsTest,
  'edit-goal': seedEditGoalTest,
  'remove-goal': seedRemoveGoalTest,
  'remove-goal-with-savings': seedRemoveGoalWithSavingsTest,
});
