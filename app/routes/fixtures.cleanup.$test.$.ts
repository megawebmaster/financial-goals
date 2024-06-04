import { buildFixtureLoader } from '~/ci/helpers';
import { cleanupCreateBudgetTest } from '~/ci/create-budget';
import { cleanupCreateGoalTest } from '~/ci/create-goal';
import { cleanupCreateSavingsTest } from '~/ci/create-savings';
import { cleanupEditGoalTest } from '~/ci/edit-goal';
import { cleanupRemoveGoalTest } from '~/ci/remove-goal';
import { cleanupRemoveGoalWithSavingsTest } from '~/ci/remove-goal-with-savings';

export const loader = buildFixtureLoader({
  'create-budget': cleanupCreateBudgetTest,
  'create-goal': cleanupCreateGoalTest,
  'create-savings': cleanupCreateSavingsTest,
  'edit-goal': cleanupEditGoalTest,
  'remove-goal': cleanupRemoveGoalTest,
  'remove-goal-with-savings': cleanupRemoveGoalWithSavingsTest,
});
