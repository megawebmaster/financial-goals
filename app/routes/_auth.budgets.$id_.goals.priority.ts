import { redirect } from '@remix-run/node';
import { redirectWithError } from 'remix-toast';
import invariant from 'tiny-invariant';

import { updateBudgetGoalsPriority } from '~/services/budget-goals.server';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      const data = await request.formData();
      const goals = data.get('goals');
      invariant(goals, 'Goals are required');
      invariant(typeof goals === 'string');

      await updateBudgetGoalsPriority(userId, budgetId, JSON.parse(goals));

      return redirect(`/budgets/${budgetId}/goals`);
    } catch (e) {
      console.error('Changing goal priority failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'error',
      );

      return redirectWithError(`/budgets/${params.id}/goals`, {
        message: t('goal.priority.change-failed'),
      });
    }
  },
);
