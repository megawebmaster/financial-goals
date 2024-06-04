import type { LoaderFunctionArgs } from '@remix-run/node';
import process from 'node:process';
import invariant from 'tiny-invariant';

import type { User } from '@prisma/client';
import { createUser } from '~/services/user.server';

export const FIXTURE_USER_PASSWORD = 'test-password-1234';

export async function seedUser(username: string): Promise<User> {
  return await createUser(
    username,
    `${username}@example.com`,
    FIXTURE_USER_PASSWORD,
  );
}

export function buildFixtureLoader(
  fixtureMap: Record<string, () => Promise<void>>,
) {
  return async function loader({ params }: LoaderFunctionArgs) {
    if (!process.env.CI) {
      return new Response(null, { status: 404 });
    }

    invariant(params.test, 'Test name is required!');
    invariant(fixtureMap[params.test], 'Unknown test name!');

    await fixtureMap[params.test]();

    return new Response(null, { status: 201 });
  };
}
