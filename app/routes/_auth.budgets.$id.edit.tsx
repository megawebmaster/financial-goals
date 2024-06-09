import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { authenticatedAction } from '~/helpers/auth';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { updateBudget } from '~/services/budgets.server';
import { BudgetForm, type BudgetFormValues } from '~/components/budget-form';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { ConfirmationForm } from '~/components/ui/confirmation-form';
import { Separator } from '~/components/ui/separator';
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
      const isDefault = data.get('isDefault') === 'true';

      invariant(name, 'Name of the budget is required');
      invariant(typeof name === 'string', 'Name must be a text');

      await updateBudget(userId, budgetId, { name, isDefault });
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

  const handleSubmit = async (values: BudgetFormValues) => {
    const encryptionKey = await unlockKey(budget.key);

    submit(
      {
        name: await encrypt(values.budgetName, encryptionKey),
        isDefault: values.isDefault,
      },
      { method: 'patch' },
    );
  };

  return (
    <>
      <PageTitle
        back={`/budgets/${budget.budgetId}`}
        title={t('budget.edit.page.title', { name: budget.name })}
      />
      <PageContent>
        <BudgetForm
          budget={budget}
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          status="update"
        >
          <Separator />
          <ConfirmationForm
            action={`/budgets/${budget.budgetId}/destroy`}
            confirmation={t('budget.edit.delete-confirm')}
            description={t('budget.edit.delete-description')}
            className="w-full"
            method="post"
            replace
          >
            {t('budget.edit.delete')}
          </ConfirmationForm>
        </BudgetForm>
      </PageContent>
    </>
  );
}
