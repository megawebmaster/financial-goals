import { useTranslation } from 'react-i18next';

import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { getGoalPercentage } from '~/helpers/budget-goals';
import { Progress } from '~/components/ui/progress';

type CurrentGoalStatusProps = {
  currencyFormat: { currency: string; locale: string };
  goal: ClientBudgetGoal;
};

const getPercentBackground = (percent: number) => {
  if (percent < 25) {
    return 'bg-orange-300';
  }
  if (percent < 50) {
    return 'bg-yellow-300';
  }
  if (percent < 75) {
    return 'bg-lime-300';
  }

  return 'bg-green-300';
};

export const CurrentGoalStatus = ({
  currencyFormat,
  goal,
}: CurrentGoalStatusProps) => {
  const { t } = useTranslation();
  const percent = getGoalPercentage(goal);

  return (
    <Progress
      className="h-8"
      color={getPercentBackground(percent)}
      value={percent}
    >
      <p className="absolute top-0 flex h-8 w-full items-center justify-center">
        {t('component.current-goal-status', {
          current: goal.currentAmount,
          required: goal.requiredAmount,
          percent,
          formatParams: {
            current: currencyFormat,
            required: currencyFormat,
          },
        })}
      </p>
    </Progress>
  );
};
