import type { FormEvent } from 'react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSubmit,
} from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { propEq } from 'ramda';
import invariant from 'tiny-invariant';

import type { BudgetInvitationsLayoutContext } from '~/helpers/budget-invitations';
import { authenticator } from '~/services/auth.server';
import { encrypt, lockKey } from '~/services/encryption.client';
import { importKey } from '~/services/encryption';
import {
  acceptInvitation,
  getInvitation,
} from '~/services/budget-invitations.server';
import { BudgetAcceptForm } from '~/components/budget-accept-form';
import { LOGIN_ROUTE } from '~/routes';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  // If the user is not already authenticated redirect to / directly
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

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
    // TODO: Handle errors notifications
    return redirect('/');
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const userId = await authenticator.isAuthenticated(request);

  if (!userId) {
    // TODO: Handle errors notifications
    return redirect(LOGIN_ROUTE);
  }

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

    return redirect(`/budgets/${budget.budgetId}`);
  } catch (e) {
    console.error('Accepting budget invitation failed', e);
    // TODO: Handle errors notifications
    return redirect('/');
  }
}

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
