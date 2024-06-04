import type { LoaderFunctionArgs } from '@remix-run/node';
import process from 'node:process';
import invariant from 'tiny-invariant';

import type { BudgetUser, User } from '@prisma/client';
import { createUser } from '~/services/user.server';
import {
  encrypt,
  generateEncryptionKey,
  generateKeyMaterial,
  generateWrappingKey,
  lockKey,
} from '~/services/encryption';
import { createBudget } from '~/services/budgets.server';

const FIXTURE_USER_PASSWORD = 'test-password-1234';

export async function seedUser(username: string): Promise<User> {
  return await createUser(
    username,
    `${username}@example.com`,
    FIXTURE_USER_PASSWORD,
  );
}

export async function seedBudget(user: User): Promise<[BudgetUser, CryptoKey]> {
  const wrappingKey = await generateWrappingKey(
    await generateKeyMaterial(FIXTURE_USER_PASSWORD),
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
      isDefault: true,
    },
  );

  return [budget, encryptionKey];
}

export function buildFixtureLoader(
  fixtureMap: Record<string, (params: string[]) => Promise<void>>,
) {
  return async function loader({ params }: LoaderFunctionArgs) {
    if (!process.env.CI) {
      return new Response(null, { status: 404 });
    }

    invariant(params.test, 'Test name is required!');
    invariant(fixtureMap[params.test], 'Unknown test name!');

    await fixtureMap[params.test](params['*']?.split('/') || []);

    return new Response(null, { status: 201 });
  };
}
