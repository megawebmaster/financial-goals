import type { FormEvent } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, useOutletContext, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { updateBudget } from '~/services/budgets.server';
import { BudgetForm } from '~/components/budget-form';
import { authenticatedAction } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('budget.edit.title'),
  };
}

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Budget ID is required');
      invariant(typeof params.id === 'string');

      const budgetId = parseInt(params.id, 10);
      invariant(!isNaN(budgetId), 'Budget ID must be a number');

      const data = await request.formData();
      const name = data.get('name');

      invariant(name, 'Name of the budget is required');
      invariant(typeof name === 'string', 'Name must be a text');

      await updateBudget(userId, budgetId, { name });
      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess(`/budgets/${budgetId}`, {
        message: t('budget.edit.changes-saved'),
      });
    } catch (e) {
      console.error('Updating budget failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'errors',
      );

      return redirectWithError(`/budgets/${params.id}/edit`, {
        message: t('budget.edit.updating-failed'),
      });
    }
  },
);

export default function () {
  const { t } = useTranslation();
  const { budget } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const encryptionKey = await unlockKey(budget.key);
    const formData = new FormData(event.target as HTMLFormElement);
    const name = await encrypt(formData.get('name') as string, encryptionKey);

    submit({ name }, { method: 'patch' });
  };

  return (
    <>
      <a href={`/budgets/${budget.budgetId}`}>{t('budget.edit.back')}</a>
      <h2>{t('budget.edit.page.title', { name: budget.name })}</h2>
      <BudgetForm
        budget={budget}
        onSubmit={handleSubmit}
        submit={t('budget.edit.form.submit')}
      />
      <Form
        action={`/budgets/${budget.budgetId}/destroy`}
        method="post"
        replace
      >
        <button type="submit">{t('budget.edit.delete.submit')}</button>
      </Form>
    </>
  );
}
