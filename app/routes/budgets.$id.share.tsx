import type { FormEvent } from 'react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useOutletContext, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { render } from '@react-email/render';
import invariant from 'tiny-invariant';

import type { BudgetsLayoutContext } from '~/helpers/budgets';
import { authenticator } from '~/services/auth.server';
import { encrypt, unlockKey } from '~/services/encryption.client';
import { BudgetShareForm } from '~/components/budget-share-form';
import { exportKey, importKey } from '~/services/encryption';
import { shareBudget } from '~/services/budget-invitations.server';
import { mailer } from '~/services/mail.server';
import { getUser } from '~/services/user.server';
import { LOGIN_ROUTE } from '~/routes';
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

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

  try {
    invariant(params.id, 'Budget ID is required');
    invariant(typeof params.id === 'string');

    const budgetId = parseInt(params.id, 10);
    invariant(!isNaN(budgetId), 'Budget ID must be a number');

    const data = await request.formData();
    const username = data.get('username');
    const invitationData = data.get('data');

    invariant(username, 'Name of the user is required');
    invariant(typeof username === 'string', 'Name of the user must be a text');
    invariant(invitationData, 'Invitation data is required');
    invariant(
      typeof invitationData === 'string',
      'Invitation data must be a text',
    );

    const invitation = await shareBudget(
      userId,
      budgetId,
      username,
      invitationData,
    );

    const author = await getUser(userId);
    const t = await i18next.getFixedT(
      await i18next.getLocale(request),
      'email',
    );
    await mailer.sendMail({
      to: username,
      subject: t('share-budget.subject'),
      html: render(
        <ShareBudgetEmail
          authorName={author.username}
          expiration={invitation.expiresAt}
          recipientName={username}
          token={invitation.id}
          t={t}
        />,
      ),
    });

    return redirect(`/budgets/${budgetId}`);
  } catch (e) {
    console.error('Sharing budget failed', e);
    // TODO: Handle errors notifications
    return redirect(`/budgets/${params.id}/share`);
  }
}

export default function () {
  const { t } = useTranslation();
  const { budget, user } = useOutletContext<BudgetsLayoutContext>();
  const submit = useSubmit();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const response = await fetch('/user/pk', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // TODO: Show the error
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
        username: formData.get('username') as string,
        data: await encrypt(data, publicKey),
      },
      { method: 'post' },
    );
  };

  return (
    <>
      <a href={`/budgets/${budget.budgetId}`}>{t('budget.share.back')}</a>
      <h2>{t('budget.share.page.title', { name: budget.name })}</h2>
      <p>{t('budget.share.page.description')}</p>
      <BudgetShareForm onSubmit={handleSubmit} />
    </>
  );
}
