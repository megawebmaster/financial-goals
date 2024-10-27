import type { FormEvent, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useOutletContext, useSubmit } from '@remix-run/react';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import { buildGoalsSorting } from '~/services/budget-goals';
import {
  buildGoalsUpdater,
  encryptBudgetGoal,
} from '~/services/budget-goals.client';
import { unlockKey } from '~/services/encryption.client';
import { Button } from '~/components/ui/button';
import { useNavigationDelay } from '~/hooks/useNavigationDelay';

type ChangePriorityButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  goal: ClientBudgetGoal;
  priority: number;
  title?: string;
};

export function ChangePriorityButton({
  children,
  disabled = false,
  goal,
  priority,
  title,
}: ChangePriorityButtonProps) {
  const { budget, goals } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();
  const loading = useNavigationDelay();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);

    const processGoals = buildGoalsUpdater(goals, budget.freeSavings);
    const { goals: updatedGoals } = processGoals(
      buildGoalsSorting(goal.id, priority),
    );

    submit(
      {
        goals: JSON.stringify(
          await Promise.all(
            updatedGoals.map((item) => encryptBudgetGoal(item, encryptionKey)),
          ),
        ),
      },
      {
        action: `/budgets/${budget.budgetId}/goals/priority`,
        method: 'post',
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button
        type="submit"
        disabled={disabled || loading}
        variant="outline"
        size="icon"
        title={title}
      >
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : children}
      </Button>
    </form>
  );
}
