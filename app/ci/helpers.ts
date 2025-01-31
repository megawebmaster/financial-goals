import type { LoaderFunctionArgs } from '@remix-run/node';
import process from 'node:process';
import invariant from 'tiny-invariant';
import { subMonths } from 'date-fns';
import { identity } from 'ramda';

import type {
  BudgetGoal,
  BudgetSavingsEntry,
  BudgetUser,
  User,
} from '@prisma/client';

import { prisma } from '~/services/db.server';
import { createUser, deleteUser } from '~/services/user.server';
import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  generateKeyMaterial,
  generateWrappingKey,
  lockKey,
} from '~/services/encryption';
import { createBudget } from '~/services/budgets.server';
import { createBudgetGoal } from '~/services/budget-goals.server';
import { createSavingsEntry } from '~/services/budget-savings-entries.server';
import { buildGoalsUpdater } from '~/services/budget-goals';

export function buildFixtureLoader(
  fixtureMap: Record<string, (params: string[]) => Promise<void>>,
) {
  return async function loader({ params }: LoaderFunctionArgs) {
    if (!process.env.CI) {
      return new Response(null, { status: 404 });
    }

    invariant(params.test, 'Test name is required!');
    invariant(fixtureMap[params.test], `Unknown test name: ${params.test}!`);

    await fixtureMap[params.test](params['*']?.split('/') || []);

    return new Response(null, { status: 201 });
  };
}

const FIXTURE_USER_PASSWORD = 'test-password-1234';

export async function seedUser(username: string): Promise<User> {
  return await createUser(
    username,
    `${username}@example.com`,
    FIXTURE_USER_PASSWORD,
    'pl-PL',
  );
}

export async function removeUserIfNeeded(username: string) {
  const user = await prisma.user.findFirst({
    where: { username },
  });

  if (user) {
    await deleteUser(user.id);
  }
}

export async function seedBudget(
  user: User,
  data: Partial<Omit<BudgetUser, 'budgetId' | 'userId' | 'key' | 'isOwner'>>,
): Promise<[BudgetUser, CryptoKey]> {
  const wrappingKey = await generateWrappingKey(
    await generateKeyMaterial(FIXTURE_USER_PASSWORD),
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
      name: await encrypt(data.name || 'Test budget', encryptionKey),
      key: await lockKey(wrappingKey, encryptionKey),
      isDefault: data.isDefault ?? true,
    },
  );

  return [budget, encryptionKey];
}

export async function seedGoal(
  user: User,
  budget: BudgetUser,
  encryptionKey: CryptoKey,
  data: Partial<Omit<BudgetGoal, 'id' | 'budgetId' | 'priority'>>,
) {
  return await createBudgetGoal(
    user.id,
    budget.budgetId,
    await encrypt('0', encryptionKey),
    {
      name: await encrypt(data.name || 'Goal', encryptionKey),
      type: data.type || 'quick',
      status: data.status || 'active',
      currentAmount: await encrypt(data.currentAmount || '0', encryptionKey),
      requiredAmount: await encrypt(
        data.requiredAmount || '1000',
        encryptionKey,
      ),
    },
  );
}

export async function seedSavings(
  user: User,
  budget: BudgetUser,
  encryptionKey: CryptoKey,
  data: Partial<Omit<BudgetSavingsEntry, 'id' | 'budgetId' | 'userId'>>,
  goals: BudgetGoal[],
) {
  const currentBudget = await prisma.budget.findFirstOrThrow({
    where: { id: budget.budgetId },
  });
  const amount = data.amount || '1000';
  const currentSavings =
    parseFloat(await decrypt(currentBudget.currentSavings, encryptionKey)) +
    parseFloat(amount);

  const decryptedGoals = await Promise.all(
    goals.map(async (goal) => ({
      ...goal,
      requiredAmount: parseFloat(
        await decrypt(goal.requiredAmount, encryptionKey),
      ),
      currentAmount: parseFloat(
        await decrypt(goal.currentAmount, encryptionKey),
      ),
    })),
  );
  const processGoals = buildGoalsUpdater(decryptedGoals, currentSavings);
  const { goals: updatedGoals, freeSavings } = processGoals(identity);

  await createSavingsEntry(
    user.id,
    budget.budgetId,
    {
      currentSavings: await encrypt(currentSavings.toString(10), encryptionKey),
      freeSavings: await encrypt(freeSavings.toString(10), encryptionKey),
    },
    {
      amount: await encrypt(amount, encryptionKey),
      createdAt: data.createdAt || subMonths(new Date(), 1),
      updatedAt: data.updatedAt || subMonths(new Date(), 1),
    },
    await Promise.all(
      updatedGoals.map(async (goal) => ({
        id: goal.id,
        currentAmount: await encrypt(
          goal.currentAmount.toString(10),
          encryptionKey,
        ),
      })),
    ),
  );
}
