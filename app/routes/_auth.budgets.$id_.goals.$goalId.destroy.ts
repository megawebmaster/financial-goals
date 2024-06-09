import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import { deleteBudgetGoal } from '~/services/budget-goals.server';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      invariant(params.goalId, 'Goal ID is required');
      invariant(typeof params.goalId === 'string');

      const goalId = parseInt(params.goalId, 10);
      invariant(!isNaN(goalId), 'Goal ID must be a number');

      const data = await request.formData();
      const freeSavings = data.get('freeSavings');
      const goals = data.get('goals');

      invariant(freeSavings, 'Free budget savings is required');
      invariant(typeof freeSavings === 'string');
      invariant(goals, 'Updated goals are required');
      invariant(typeof goals === 'string');

      await deleteBudgetGoal(
        userId,
        budgetId,
        goalId,
        freeSavings,
        JSON.parse(goals),
      );
      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess(`/budgets/${budgetId}/goals`, {
        message: t('goal.deleted'),
      });
    } catch (e) {
      console.error('Deleting goal failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'error',
      );

      return redirectWithError(
        `/budgets/${params.id}/goals/${params.goalId}/edit`,
        { message: t('goal.deletion-failed') },
      );
    }
  },
);
