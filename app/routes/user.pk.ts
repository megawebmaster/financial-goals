import type { LoaderFunctionArgs } from '@remix-run/node';
import { Response } from '@remix-run/web-fetch';

import { authenticator } from '~/services/auth.server';
import { getUserPK } from '~/services/user.server';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const action = authenticatedAction(async ({ request }, userId) => {
  try {
    const data = await request.formData();
    const email = data.get('email') as string;

    return {
      email,
      key: await getUserPK(email),
    };
  } catch (e) {
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'error',
    );

    return new Response(t('user.not-found'), { status: 403 });
  }
});

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request);
}
