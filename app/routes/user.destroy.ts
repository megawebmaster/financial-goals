import type { LoaderFunctionArgs } from '@remix-run/node';
import type { ClientActionFunctionArgs } from '@remix-run/react';
import { redirectWithError } from 'remix-toast';
import { toast } from 'sonner';

import { INDEX_ROUTE } from '~/routes';
import { authenticator } from '~/services/auth.server';
import { clearEncryption } from '~/services/encryption.client';
import { deleteUser } from '~/services/user.server';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const action = authenticatedAction(async ({ request }, userId) => {
  try {
    await deleteUser(userId);
  } catch (e) {
    console.error('Unable to delete user', e);
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'error',
    );

    return redirectWithError(INDEX_ROUTE, {
      message: t('user.deletion-failed'),
    });
  }

  return await authenticator.logout(request, {
    redirectTo: INDEX_ROUTE,
  });
});

export async function clientAction({ serverAction }: ClientActionFunctionArgs) {
  await clearEncryption();
  toast.dismiss();
  return await serverAction<typeof action>();
}

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request);
}
