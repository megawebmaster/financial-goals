import type { ClientLoaderFunctionArgs } from '@remix-run/react';

import { INDEX_ROUTE } from '~/routes';
import { authenticator } from '~/services/auth.server';
import { clearEncryption } from '~/services/encryption.client';
import { authenticatedLoader } from '~/helpers/auth';

export const loader = authenticatedLoader(async ({ request }, userId) => {
  return await authenticator.logout(request, {
    redirectTo: INDEX_ROUTE,
  });
});

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  await clearEncryption();
  return await serverLoader<typeof loader>();
}
