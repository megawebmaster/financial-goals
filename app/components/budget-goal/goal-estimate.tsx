import { useTranslation } from 'react-i18next';
import { CheckIcon } from 'lucide-react';

import { MONTH_FORMAT } from '~/helpers/dates';
import { getGoalEstimatedCompletion } from '~/helpers/budget-goals';

type EstimateProps = {
  amountToSave: number;
  averageSavings: number;
};

export function GoalEstimate({ averageSavings, amountToSave }: EstimateProps) {
  const { t } = useTranslation();

  if (amountToSave === 0) {
    return null;
  }
  if (averageSavings === 0) {
    return null;
  }

  const date = getGoalEstimatedCompletion(amountToSave, averageSavings);
  if (!date) {
    return <CheckIcon className="text-green-500" />;
  }

  return t('goals.estimation', {
    date,
    formatParams: {
      date: MONTH_FORMAT,
    },
  });
}
