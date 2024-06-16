import type { FormEvent, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { pipe } from 'ramda';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { buildGoalsFiller, buildGoalsSorting } from '~/services/budget-goals';
import { encryptBudgetGoal } from '~/services/budget-goals.client';
import { unlockKey } from '~/services/encryption.client';
import { Button } from '~/components/ui/button';
import { useNavigationDelay } from '~/hooks/useNavigationDelay';

type ChangePriorityButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  goalId: number;
  priority: number;
  title?: string;
};

export function ChangePriorityButton({
  children,
  disabled = false,
  goalId,
  priority,
  title,
}: ChangePriorityButtonProps) {
  const { budget, goals } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();
  const loading = useNavigationDelay();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await unlockKey(budget.key);
    const amount = goals.reduce(
      (result, goal) => result + goal.currentAmount,
      0,
    );

    const processGoals = pipe(
      buildGoalsSorting(goalId, priority),
      buildGoalsFiller(amount),
    );

    const updatedGoals = await Promise.all(
      processGoals(goals).map((item) => encryptBudgetGoal(item, encryptionKey)),
    );

    submit(
      { goals: JSON.stringify(updatedGoals) },
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
