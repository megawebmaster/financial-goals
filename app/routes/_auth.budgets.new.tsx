import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';
import { isEmpty } from 'ramda';

import { authenticatedAction } from '~/helpers/auth';
import {
  encrypt,
  generateEncryptionKey,
  lockKey,
} from '~/services/encryption.client';
import { createBudget } from '~/services/budgets.server';
import type { AuthenticatedLayoutContext } from '~/helpers/budgets';
import type { BudgetFormValues } from '~/components/budget-form';
import { BudgetForm } from '~/components/budget-form';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('budget.new.title'),
  };
}

export const action = authenticatedAction(async ({ request }, userId) => {
  try {
    const data = await request.formData();
    const name = data.get('name');
    const key = data.get('key');
    const currency = data.get('currency');
    const currentSavings = data.get('currentSavings');
    const freeSavings = data.get('freeSavings');
    const isDefault = data.get('isDefault') === 'true';

    invariant(name, 'Name of the budget is required');
    invariant(typeof name === 'string', 'Name must be encrypted');
    invariant(key, 'Budget encryption key is required');
    invariant(typeof key === 'string', 'Encryption key must be a text');
    invariant(currency, 'Budget currency is required');
    invariant(typeof currency === 'string', 'Currency must be encrypted');
    invariant(currentSavings, 'Current savings value required');
    invariant(
      typeof currentSavings === 'string',
      'Current savings must be encrypted',
    );
    invariant(freeSavings, 'Free savings value required');
    invariant(
      typeof freeSavings === 'string',
      'Free savings must be encrypted',
    );

    const budget = await createBudget(
      userId,
      { currency, currentSavings, freeSavings },
      { name, key, isDefault },
    );
    const t = await i18next.getFixedT(await i18next.getLocale(request));

    return redirectWithSuccess(`/budgets/${budget.budgetId}`, {
      message: t('budget.new.created'),
    });
  } catch (e) {
    console.error('Creating budget failed', e);
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'error',
    );

    return redirectWithError('/budgets/new', {
      message: t('budget.new.creation-failed'),
    });
  }
});

export default function () {
  const { t } = useTranslation();
  const { budgets } = useOutletContext<AuthenticatedLayoutContext>();
  const submit = useSubmit();
  const handleSubmit = async (values: BudgetFormValues) => {
    const encryptionKey = await generateEncryptionKey();
    const zeroValue = await encrypt('0', encryptionKey);

    submit(
      {
        name: await encrypt(values.budgetName, encryptionKey),
        currency: await encrypt(values.budgetCurrency, encryptionKey),
        key: await lockKey(encryptionKey),
        isDefault: values.isDefault,
        currentSavings: zeroValue,
        freeSavings: zeroValue,
      },
      { method: 'post' },
    );
  };

  return (
    <>
      <PageTitle title={t('budget.new.page.title')} />
      <PageContent>
        <BudgetForm
          isFirst={isEmpty(budgets)}
          onSubmit={handleSubmit}
          status="create"
        />
      </PageContent>
    </>
  );
}
