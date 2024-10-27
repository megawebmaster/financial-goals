import { useTranslation } from 'react-i18next';

import { GoalEstimate } from '~/components/budget-goal/goal-estimate';
import type {
  ClientBudgetGoal,
  ClientBudgetSavingsEntry,
} from '~/helpers/budget-goals';
import { getAverageSavings } from '~/services/budget-savings-entries.client';
import { buildAmountToSaveCalculator } from '~/services/budget-goals.client';

type GoalEstimatedCompletion = {
  currentGoal: ClientBudgetGoal;
  baseSavingsAmount?: number;
  goals: ClientBudgetGoal[];
  savings: ClientBudgetSavingsEntry[];
};

export function GoalEstimatedCompletion({
  currentGoal,
  baseSavingsAmount = 0,
  goals,
  savings,
}: GoalEstimatedCompletion) {
  const { t } = useTranslation();
  const averageSavings = getAverageSavings(savings);
  const amountToSaveCalculator = buildAmountToSaveCalculator(
    baseSavingsAmount,
    goals,
  );

  if (averageSavings <= 0) {
    return null;
  }

  return (
    <p className="flex gap-1">
      <strong>{t('budget.view.current-goal.estimated-completion')}:</strong>
      <GoalEstimate
        averageSavings={averageSavings}
        amountToSave={amountToSaveCalculator(currentGoal.id)}
      />
    </p>
  );
}
