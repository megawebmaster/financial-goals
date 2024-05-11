import { addMonths } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { MONTH_FORMAT } from '~/helpers/dates';

type EstimateProps = {
  amountToSave: number;
  averageSavings: number;
};

export function GoalEstimate({ averageSavings, amountToSave }: EstimateProps) {
  const { t } = useTranslation();

  if (amountToSave === 0) {
    return null;
  }

  const months = Math.ceil(amountToSave / averageSavings);

  return t('goals.estimation', {
    date: addMonths(new Date(), months),
    formatParams: {
      date: MONTH_FORMAT,
    },
  });
}
