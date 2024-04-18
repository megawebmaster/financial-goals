import type { FormEvent } from 'react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

import { authenticator } from '~/services/auth.server';
import {
  encrypt,
  generateEncryptionKey,
  lockKey,
} from '~/services/encryption.client';
import { createBudget } from '~/services/budgets.server';
import { BudgetForm } from '~/components/budget-form';
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

export async function action({ request }: ActionFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect('/');
  }

  try {
    const data = await request.formData();
    const name = data.get('name');
    const key = data.get('key');
    const currentSavings = data.get('currentSavings');
    const freeSavings = data.get('freeSavings');

    invariant(name, 'Name of the budget is required');
    invariant(typeof name === 'string', 'Name must be a text');
    invariant(key, 'Budget encryption key is required');
    invariant(typeof key === 'string', 'Encryption key must be a text');
    invariant(currentSavings, 'Current savings value required');
    invariant(typeof currentSavings === 'string', 'Current savings a text');
    invariant(freeSavings, 'Free savings value required');
    invariant(typeof freeSavings === 'string', 'Free savings a text');

    const budget = await createBudget(
      userId,
      { currentSavings, freeSavings },
      { name, key },
    );
    return redirect(`/budgets/${budget.budgetId}`);
  } catch (e) {
    console.error('Creating budget failed', e);
    // TODO: Handle errors notifications
    return redirect('/budgets/new');
  }
}

export default function () {
  const { t } = useTranslation();
  const submit = useSubmit();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const encryptionKey = await generateEncryptionKey();
    const formData = new FormData(event.target as HTMLFormElement);

    const name = await encrypt(formData.get('name') as string, encryptionKey);
    const zeroValue = await encrypt('0', encryptionKey);
    const key = await lockKey(encryptionKey);

    submit(
      { name, key, currentSavings: zeroValue, freeSavings: zeroValue },
      { method: 'post' },
    );
  };

  return (
    <>
      <a href="/budgets">{t('budget.new.back')}</a>
      <h2>{t('budget.new.page.title')}</h2>
      <BudgetForm
        onSubmit={handleSubmit}
        submit={t('budget.new.form.submit')}
      />
    </>
  );
}
