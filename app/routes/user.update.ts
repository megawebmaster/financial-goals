import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import { updateUser } from '~/services/user.server';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const action = authenticatedAction(async ({ request }, userId) => {
  try {
    const data = await request.formData();
    const preferredLocale = data.get('preferredLocale');

    invariant(preferredLocale, 'Locale is required');
    invariant(typeof preferredLocale === 'string', 'Locale must be encrypted');

    await updateUser(userId, { preferredLocale });
  } catch (e) {
    console.error('Unable to update user', e);
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'error',
    );

    return redirectWithError('/user/settings', {
      message: t('user.update-failed'),
    });
  }

  const t = await i18next.getFixedT(await i18next.getLocale(request), 'common');

  return await redirectWithSuccess('/user/settings', {
    message: t('user-settings.general.changes-saved'),
  });
});

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request);
}
