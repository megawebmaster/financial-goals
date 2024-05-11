import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import { declineInvitation } from '~/services/budget-invitations.server';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Invitations ID is required');
      invariant(typeof params.id === 'string');

      await declineInvitation(params.id, userId);
      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess('/budgets/invitations', {
        message: t('budget-invitations.declined'),
      });
    } catch (e) {
      console.error('Deleting invitations failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'error',
      );

      return redirectWithError(`/budgets/invitations/${params.id}`, {
        message: t('budget-invitations.decline-failed'),
      });
    }
  },
);
