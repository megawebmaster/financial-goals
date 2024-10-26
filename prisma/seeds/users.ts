import { subMonths } from 'date-fns';

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
import { prisma } from '~/services/db.server';

export async function seedUsers() {
  await seedUser('Test 1', 'test@example.com');
  await createUser('Test 2', 'test2@example.com', 'test', 'pl-PL');
}

async function seedUser(username: string, email: string) {
  const user = await createUser(username, email, 'test', 'pl-PL');

  const wrappingKey = await generateWrappingKey(
    await generateKeyMaterial('test'),
    user.salt,
  );
  const encryptionKey = await generateEncryptionKey();
  const encryptedZero = await encrypt('0', encryptionKey);
  const currency = await encrypt('PLN', encryptionKey);

  const budget = await createBudget(
    user.id,
    {
      currency,
      currentSavings: encryptedZero,
      freeSavings: encryptedZero,
    },
    {
      name: await encrypt('Test budget 1', encryptionKey),
      key: await lockKey(wrappingKey, encryptionKey),
      isDefault: true,
    },
  );

  const goal1 = await createBudgetGoal(
    user.id,
    budget.budgetId,
    encryptedZero,
    {
      name: await encrypt('Goal 1', encryptionKey),
      type: 'short',
      status: 'active',
      currentAmount: encryptedZero,
      requiredAmount: await encrypt('1000', encryptionKey),
    },
  );
  await prisma.budgetGoal.update({
    where: { id: goal1.id },
    data: { createdAt: subMonths(new Date(), 4).toISOString() },
  });

  const goal2 = await createBudgetGoal(
    user.id,
    budget.budgetId,
    encryptedZero,
    {
      name: await encrypt('Goal 2', encryptionKey),
      type: 'short',
      status: 'active',
      currentAmount: encryptedZero,
      requiredAmount: await encrypt('500', encryptionKey),
    },
  );
  await prisma.budgetGoal.update({
    where: { id: goal2.id },
    data: { createdAt: subMonths(new Date(), 1).toISOString() },
  });

  const goal3 = await createBudgetGoal(
    user.id,
    budget.budgetId,
    encryptedZero,
    {
      name: await encrypt('Goal 3', encryptionKey),
      type: 'short',
      status: 'active',
      currentAmount: encryptedZero,
      requiredAmount: await encrypt('250', encryptionKey),
    },
  );
  await prisma.budgetGoal.update({
    where: { id: goal3.id },
    data: { createdAt: subMonths(new Date(), 1).toISOString() },
  });

  await createBudgetGoal(user.id, budget.budgetId, encryptedZero, {
    name: await encrypt('Goal 4', encryptionKey),
    type: 'long',
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
      createdAt: subMonths(new Date(), 4),
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
      createdAt: subMonths(new Date(), 3),
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
      createdAt: subMonths(new Date(), 2),
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
      createdAt: subMonths(new Date(), 1),
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
      createdAt: new Date(),
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
