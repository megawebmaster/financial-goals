import { createUser } from '~/services/user.server';
import {
  encrypt,
  generateEncryptionKey,
  generateKeyMaterial,
  generateWrappingKey,
  lockKey,
} from '~/services/encryption';
import { createBudget } from '~/services/budgets.server';
import { createBudgetGoal } from '~/services/budget-goals.server';
import { createSavingsEntry } from '~/services/budget-savings-entries.server';
import { subMonths } from 'date-fns';

export async function seedUsers() {
  await seedUser('test@example.com');
  await createUser('test2@example.com', 'test');
}

async function seedUser(username: string) {
  const user = await createUser(username, 'test');

  const wrappingKey = await generateWrappingKey(
    await generateKeyMaterial('test'),
    user.salt,
  );
  const encryptionKey = await generateEncryptionKey();
  const encryptedZero = await encrypt('0', encryptionKey);

  const budget = await createBudget(
    user.id,
    {
      currentSavings: encryptedZero,
      freeSavings: encryptedZero,
    },
    {
      name: await encrypt('Test budget 1', encryptionKey),
      key: await lockKey(wrappingKey, encryptionKey),
    },
  );

  const goal1 = await createBudgetGoal(
    user.id,
    budget.budgetId,
    encryptedZero,
    {
      name: await encrypt('Goal 1', encryptionKey),
      status: 'active',
      currentAmount: encryptedZero,
      requiredAmount: await encrypt('1000', encryptionKey),
    },
  );

  const goal2 = await createBudgetGoal(
    user.id,
    budget.budgetId,
    encryptedZero,
    {
      name: await encrypt('Goal 2', encryptionKey),
      status: 'active',
      currentAmount: encryptedZero,
      requiredAmount: await encrypt('500', encryptionKey),
    },
  );

  const goal3 = await createBudgetGoal(
    user.id,
    budget.budgetId,
    encryptedZero,
    {
      name: await encrypt('Goal 3', encryptionKey),
      status: 'active',
      currentAmount: encryptedZero,
      requiredAmount: await encrypt('250', encryptionKey),
    },
  );

  await createBudgetGoal(user.id, budget.budgetId, encryptedZero, {
    name: await encrypt('Goal 4', encryptionKey),
    status: 'active',
    currentAmount: encryptedZero,
    requiredAmount: await encrypt('500', encryptionKey),
  });

  await createSavingsEntry(
    user.id,
    budget.budgetId,
    {
      currentSavings: await encrypt('300', encryptionKey),
      freeSavings: await encrypt('0', encryptionKey),
    },
    {
      amount: await encrypt('300', encryptionKey),
      date: subMonths(new Date(), 4),
    },
    [
      {
        id: goal1.id,
        currentAmount: await encrypt('300', encryptionKey),
      },
    ],
  );

  await createSavingsEntry(
    user.id,
    budget.budgetId,
    {
      currentSavings: await encrypt('500', encryptionKey),
      freeSavings: await encrypt('0', encryptionKey),
    },
    {
      amount: await encrypt('200', encryptionKey),
      date: subMonths(new Date(), 3),
    },
    [
      {
        id: goal1.id,
        currentAmount: await encrypt('500', encryptionKey),
      },
    ],
  );

  await createSavingsEntry(
    user.id,
    budget.budgetId,
    {
      currentSavings: await encrypt('800', encryptionKey),
      freeSavings: await encrypt('0', encryptionKey),
    },
    {
      amount: await encrypt('300', encryptionKey),
      date: subMonths(new Date(), 2),
    },
    [
      {
        id: goal1.id,
        currentAmount: await encrypt('800', encryptionKey),
      },
      {
        id: goal2.id,
        currentAmount: await encrypt('0', encryptionKey),
      },
      {
        id: goal3.id,
        currentAmount: await encrypt('0', encryptionKey),
      },
    ],
  );

  await createSavingsEntry(
    user.id,
    budget.budgetId,
    {
      currentSavings: await encrypt('1400', encryptionKey),
      freeSavings: await encrypt('0', encryptionKey),
    },
    {
      amount: await encrypt('600', encryptionKey),
      date: subMonths(new Date(), 1),
    },
    [
      {
        id: goal1.id,
        currentAmount: await encrypt('1000', encryptionKey),
      },
      {
        id: goal2.id,
        currentAmount: await encrypt('400', encryptionKey),
      },
    ],
  );

  await createSavingsEntry(
    user.id,
    budget.budgetId,
    {
      currentSavings: await encrypt('1700', encryptionKey),
      freeSavings: await encrypt('0', encryptionKey),
    },
    {
      amount: await encrypt('300', encryptionKey),
      date: subMonths(new Date(), 0),
    },
    [
      {
        id: goal2.id,
        currentAmount: await encrypt('500', encryptionKey),
      },
      {
        id: goal3.id,
        currentAmount: await encrypt('200', encryptionKey),
      },
    ],
  );
}
