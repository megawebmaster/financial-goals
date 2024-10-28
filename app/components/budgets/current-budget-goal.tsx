import type { ReactNode } from 'react';
import { useOutletContext } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import type {
  AuthenticatedLayoutContext,
  ClientBudget,
} from '~/helpers/budgets';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { CurrentGoalStatus } from '~/components/budgets/current-goal-status';

type CurrentBudgetGoalProps = {
  budget: ClientBudget;
  children?: ReactNode;
  goal?: ClientBudgetGoal;
  type: string;
};

export function CurrentBudgetGoal({
  budget,
  children,
  goal,
  type,
}: CurrentBudgetGoalProps) {
  const { t } = useTranslation();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();
  const FORMAT_CURRENCY = {
    currency: budget.currency,
    locale: user.preferredLocale,
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex gap-2 text-xl">
          {goal
            ? t(`component.current-goal.${type}.title`, { name: goal.name })
            : t(`component.current-goal.${type}.no-goal`)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 grow justify-center">
        {goal && (
          <CurrentGoalStatus currencyFormat={FORMAT_CURRENCY} goal={goal} />
        )}
        {children}
      </CardContent>
    </Card>
  );
}
