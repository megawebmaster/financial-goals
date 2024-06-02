import type { ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';

import type { BudgetUser } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { BudgetsList } from '~/components/budgets-list';
import { Skeleton } from '~/components/ui/skeleton';

type BudgetsMenuProps = {
  budgets: BudgetUser[];
  children: ReactNode;
};

export function BudgetsMenu({ budgets, children }: BudgetsMenuProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" className="font-normal md:text-base">
          {children}
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <BudgetsList budgets={budgets}>
          <BudgetsList.Pending>
            <Skeleton className="h-6 mx-2" />
            <Skeleton className="h-6 mx-2" />
            <Skeleton className="h-6 mx-2" />
          </BudgetsList.Pending>
          <BudgetsList.Fulfilled>
            {(budgets) => (
              <>
                {budgets.map((budget) => (
                  <DropdownMenuItem
                    key={budget.budgetId}
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to={`/budgets/${budget.budgetId}`}>
                      {budget.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {budgets.length > 0 && <DropdownMenuSeparator />}
              </>
            )}
          </BudgetsList.Fulfilled>
        </BudgetsList>
        <DropdownMenuItem asChild>
          <Link to="/budgets/new">
            <PlusIcon className="mr-2 size-4" />
            <span>{t('component.budgets-menu.create')}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
