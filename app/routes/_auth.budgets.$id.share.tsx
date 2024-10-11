import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { render } from '@react-email/render';
import {
  redirectWithError,
  redirectWithInfo,
  redirectWithSuccess,
} from 'remix-toast';
import { toast } from 'sonner';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { authenticatedAction } from '~/helpers/auth';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { exportKey, importKey } from '~/services/encryption';
import {
  BudgetAlreadySharedError,
  shareBudget,
} from '~/services/budget-invitations.server';
import { mailer } from '~/services/mail.server';
import { getUser } from '~/services/user.server';
import type { BudgetShareFormValues } from '~/components/budget-share-form';
import { BudgetShareForm } from '~/components/budget-share-form';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import ShareBudgetEmail from '~/emails/share-budget-email';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('budget.share.title'),
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
      const email = data.get('email');
      const invitationData = data.get('data');

      invariant(email, 'Email of the user is required');
      invariant(typeof email === 'string', 'Email of the user must be a text');
      invariant(invitationData, 'Invitation data is required');
      invariant(
        typeof invitationData === 'string',
        'Invitation data must be a text',
      );

      const invitation = await shareBudget(
        userId,
        budgetId,
        email,
        invitationData,
      );

      const author = await getUser(userId);
      const emailT = await i18next.getFixedT(
        await i18next.getLocale(request),
        'email',
      );
      await mailer.sendMail({
        to: email,
        subject: emailT('share-budget.subject'),
        html: await render(
          <ShareBudgetEmail
            authorName={author.username}
            expiration={invitation.expiresAt}
            recipientName={email}
            token={invitation.id}
            t={emailT}
          />,
        ),
      });

      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess(`/budgets/${budgetId}`, {
        message: t('budget.share.created', { email }),
      });
    } catch (e) {
      if (e instanceof BudgetAlreadySharedError) {
        const t = await i18next.getFixedT(await i18next.getLocale(request));

        return redirectWithInfo(`/budgets/${params.id}`, {
          message: t('budget.share.already-shared'),
        });
      }

      console.error('Sharing budget failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'errors',
      );

      return redirectWithError(`/budgets/${params.id}/share`, {
        message: t('budget.share.failed'),
      });
    }
  },
);

export default function () {
  const { t } = useTranslation();
  const { budget, user } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (values: BudgetShareFormValues) => {
    const formData = new FormData();
    formData.set('email', values.email);
    const response = await fetch('/user/pk', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      toast.error(t('budget.share.user-not-found', { email: values.email }));
      return;
    }

    const result = await response.json();
    const publicKey = await importKey(result.key, ['encrypt']);
    const encryptionKey = await exportKey(await unlockKey(budget.key));
    const data = JSON.stringify({
      key: encryptionKey,
      budget: budget.name,
      user: user.username,
    });

    submit(
      {
        email: values.email,
        data: await encrypt(data, publicKey),
      },
      { method: 'post' },
    );
  };

  return (
    <>
      <PageTitle
        back={`/budgets/${budget.budgetId}`}
        title={t('budget.share.page.title', { name: budget.name })}
      />
      <PageContent>
        <BudgetShareForm budgetId={budget.budgetId} onSubmit={handleSubmit} />
      </PageContent>
    </>
  );
}
