import invariant from 'tiny-invariant';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';

import { deleteBudget } from '~/services/budgets.server';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      await deleteBudget(userId, budgetId);
      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess('/budgets', { message: t('budget.deleted') });
    } catch (e) {
      console.error('Deleting budget failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'error',
      );

      return redirectWithError(`/budgets/${params.id}/edit`, {
        message: t('budget.deletion-failed'),
      });
    }
  },
);
