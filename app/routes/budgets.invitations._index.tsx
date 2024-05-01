import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, useOutletContext } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import type { BudgetInvitationsLayoutContext } from '~/helpers/budget-invitations';
import i18next from '~/i18n.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    title: t('budget-invitations.title'),
  };
}

export default function () {
  const { t } = useTranslation();
  const { invitations } = useOutletContext<BudgetInvitationsLayoutContext>();

  return (
    <>
      <a href="/">{t('budget-invitations.back')}</a>
      <h2>{t('budget-invitations.page.title')}:</h2>
      {invitations.length === 0 && <p>{t('budget-invitations.page.empty')}</p>}
      <ul>
        {invitations.map((invitation) => (
          <li key={invitation.id}>
            {invitation.budget} - {invitation.user}{' '}
            <a href={`/budgets/invitations/${invitation.id}`}>
              {t('budget-invitations.page.accept')}
            </a>{' '}
            <Form
              action={`/budgets/invitations/${invitation.id}/destroy`}
              method="POST"
            >
              <button type="submit">
                {t('budget-invitations.page.decline')}
              </button>
            </Form>
          </li>
        ))}
      </ul>
    </>
  );
}
