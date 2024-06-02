import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';
import { getDefaultBudget } from '~/services/budgets.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (userId) {
    const defaultBudget = await getDefaultBudget(userId);

    return redirect(`/budgets/${defaultBudget.budgetId}`);
  }

  return redirect('/login');
}
