import type { MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { getBudgets } from '~/services/budgets.server';
import { BudgetsList } from '~/components/budgets-list';
import { authenticatedLoader } from '~/helpers/auth';
import i18next from '~/i18n.server';
import { PageTitle } from '~/components/ui/page-title';
import { Button } from '~/components/ui/button';
import { PageContent } from '~/components/ui/page-content';
import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  {
    title: data?.title || 'Financial Goals',
  },
];

export const loader = authenticatedLoader(async ({ request }, userId) => {
  const t = await i18next.getFixedT(await i18next.getLocale(request));

  return {
    budgets: await getBudgets(userId),
    title: t('budgets.title'),
  };
});

type MessageProps = {
  children: React.ReactNode;
};
const Message = ({ children }: MessageProps) => (
  <p className="text-center font-semibold text-lg">{children}</p>
);

export default function () {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <PageTitle>{t('budgets.page.title')}</PageTitle>
      <PageContent>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-2">
            <BudgetsList budgets={data.budgets}>
              <BudgetsList.Pending>
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
              </BudgetsList.Pending>
              <BudgetsList.Fulfilled>
                {(budgets) => (
                  <>
                    {budgets.length === 0 && (
                      <Message>{t('budgets.list.empty')}</Message>
                    )}
                    {budgets?.map((budget) => (
                      <Button
                        key={budget.budgetId}
                        asChild
                        variant="outline"
                        size="lg"
                        className="justify-start text-lg py-6"
                      >
                        <Link to={`/budgets/${budget.budgetId}`}>
                          {budget.name}
                        </Link>
                      </Button>
                    ))}
                  </>
                )}
              </BudgetsList.Fulfilled>
            </BudgetsList>
            <Button asChild variant="secondary" className="self-end">
              <Link to="/budgets/new">{t('budgets.list.create')}</Link>
            </Button>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
