import { useTranslation } from 'react-i18next';
import { useOutletContext } from '@remix-run/react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type {
  AuthenticatedLayoutContext,
  ClientBudget,
} from '~/helpers/budgets';
import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';
import { getAverageSavings } from '~/services/budget-savings-entries.client';

type BudgetStatusProps = {
  budget: ClientBudget;
  savings: ClientBudgetSavingsEntry[];
};

export function BudgetStatus({ budget, savings }: BudgetStatusProps) {
  const { t } = useTranslation();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();
  const averageSavings = getAverageSavings(savings);
  const FORMAT_CURRENCY = {
    currency: budget.currency,
    locale: user.preferredLocale,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t('budget.view.status')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <strong>{t('budget.view.current-savings')}:</strong>{' '}
          {t('budget.view.savings-value', {
            average: averageSavings,
            value: budget.currentSavings,
            formatParams: {
              average: FORMAT_CURRENCY,
              value: FORMAT_CURRENCY,
            },
          })}
        </p>
        {budget.freeSavings > 0 && (
          <p>
            <strong>{t('budget.view.free-savings')}:</strong>{' '}
            {t('budget.view.free-savings-value', {
              value: budget.freeSavings,
              formatParams: {
                value: FORMAT_CURRENCY,
              },
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
