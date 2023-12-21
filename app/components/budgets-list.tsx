import type { PromiseFn } from 'react-async';
import { createInstance } from 'react-async';
import type { BudgetUser } from '@prisma/client';

import { decrypt, unlockKey } from '~/services/encryption.client';

type BudgetsListProps = {
  budgets: BudgetUser[];
};

const decryptBudgets: PromiseFn<BudgetUser[]> = ({ budgets }) =>
  Promise.all(
    budgets.map(async (budget: BudgetUser) => {
      const key = await unlockKey(budget.key);

      return {
        ...budget,
        name: await decrypt(budget.name, key),
      };
    }),
  );

const Budgets = createInstance(
  { promiseFn: decryptBudgets },
  'DecryptedBudgets',
);

export const BudgetsList = ({ budgets }: BudgetsListProps) => {
  return (
    <Budgets budgets={budgets}>
      <Budgets.Fulfilled>
        {(data) => (
          <ul>
            {data?.map((budget) => (
              <li key={budget.budgetId}>{budget.name}</li>
            ))}
          </ul>
        )}
      </Budgets.Fulfilled>
    </Budgets>
  );
};
