import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirectWithError } from 'remix-toast';

import { INDEX_ROUTE } from '~/routes';
import { authenticator } from '~/services/auth.server';
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

    return redirectWithError('/budgets', {
      message: t('user.deletion-failed'),
    });
  }

  return await authenticator.logout(request, {
    redirectTo: INDEX_ROUTE,
  });
});

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request);
}
