import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, Link, useOutletContext } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { BanIcon, CheckIcon } from 'lucide-react';

import type { BudgetInvitationsLayoutContext } from '~/helpers/budget-invitations';
import { PageTitle } from '~/components/ui/page-title';
import { PageContent } from '~/components/ui/page-content';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
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
      <PageTitle title={t('budget-invitations.page.title')} />
      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 text-2xl">
              {t('budget-invitations.table.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('budget-invitations.table.username')}
                  </TableHead>
                  <TableHead>
                    {t('budget-invitations.table.budget-name')}
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      {t('budget-invitations.page.empty')}
                    </TableCell>
                  </TableRow>
                )}
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.budget}</TableCell>
                    <TableCell>{invitation.user}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          variant="outline"
                          className="bg-green-300 hover:bg-green-200"
                        >
                          <Link to={`/budgets/invitations/${invitation.id}`}>
                            <CheckIcon className="mr-2 size-4" />
                            <span>{t('budget-invitations.page.accept')}</span>
                          </Link>
                        </Button>
                        <Form
                          action={`/budgets/invitations/${invitation.id}/destroy`}
                          method="POST"
                        >
                          <Button
                            type="submit"
                            className="bg-red-300 hover:bg-red-200 text-black"
                          >
                            <BanIcon className="mr-2 size-4" />
                            <span>{t('budget-invitations.page.decline')}</span>
                          </Button>
                        </Form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
