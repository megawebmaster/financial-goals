import type { FormEvent } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSubmit,
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { propEq } from 'ramda';
import { redirectWithError, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import type { BudgetInvitationsLayoutContext } from '~/helpers/budget-invitations';
import { encrypt, lockKey } from '~/services/encryption.client';
import { importKey } from '~/services/encryption';
import {
  acceptInvitation,
  getInvitation,
} from '~/services/budget-invitations.server';
import { BudgetAcceptForm } from '~/components/budget-accept-form';
import { authenticatedAction, authenticatedLoader } from '~/helpers/auth';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export const loader = authenticatedLoader(
  async ({ request, params }, userId) => {
    if (!params.id) {
      return redirect('/');
    }

    try {
      const t = await i18next.getFixedT(await i18next.getLocale(request));
      await getInvitation(params.id, userId);

      return {
        title: t('budget.share.accept.title'),
      };
    } catch (e) {
      console.error('Budget invitation error', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'error',
      );

      return redirectWithError('/', {
        message: t('budget-invitations.not-found'),
      });
    }
  },
);

export const action = authenticatedAction(
  async ({ params, request }, userId) => {
    try {
      invariant(params.id, 'Invitation ID is required');
      invariant(typeof params.id === 'string');

      const data = await request.formData();
      const name = data.get('name');
      const key = data.get('key');

      invariant(name, 'Name of the budget is required');
      invariant(typeof name === 'string', 'Budget name must be a text');
      invariant(key, 'Budget encryption key is required');
      invariant(typeof key === 'string', 'Encryption key must be a text');

      const budget = await acceptInvitation(params.id, userId, name, key);
      const t = await i18next.getFixedT(await i18next.getLocale(request));

      return redirectWithSuccess(`/budgets/${budget.budgetId}`, {
        message: t('budget-invitations.accepted'),
      });
    } catch (e) {
      console.error('Accepting budget invitation failed', e);
      const t = await i18next.getFixedT(
        await i18next.getLocale(request),
        'error',
      );

      return redirectWithError('/', {
        message: t('budget-invitations.accepting-failed'),
      });
    }
  },
);

export default function () {
  const { t } = useTranslation();
  const { id } = useParams();
  const { invitations } = useOutletContext<BudgetInvitationsLayoutContext>();
  const invitation = invitations.find(propEq(id, 'id'));
  const submit = useSubmit();
  const navigate = useNavigate();

  if (!invitation) {
    return navigate('/budget/invitations');
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;

    const budgetEncryptionKey = await importKey(invitation.key, [
      'encrypt',
      'decrypt',
    ]);

    submit(
      {
        name: await encrypt(name, budgetEncryptionKey),
        key: await lockKey(budgetEncryptionKey),
      },
      { method: 'POST' },
    );
  };

  return (
    <>
      <a href={'/'}>{t('budget.share.accept.back')}</a>
      <h2>{t('budget.share.accept.page.title')}</h2>
      <p>{t('budget.share.accept.page.description')}</p>
      <BudgetAcceptForm name={invitation.budget} onSubmit={handleSubmit} />
    </>
  );
}
