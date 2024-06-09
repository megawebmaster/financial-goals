import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, HeartIcon, PlusIcon, ShieldIcon } from 'lucide-react';
import { propEq } from 'ramda';

import type { BudgetUser } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';

type BudgetsMenuProps = {
  budgets: BudgetUser[];
  selectedBudgetId: number;
};

export function BudgetsMenu({ budgets, selectedBudgetId }: BudgetsMenuProps) {
  const { t } = useTranslation();
  const currentBudget = budgets.find(propEq(selectedBudgetId, 'budgetId'));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" className="font-normal md:text-base">
          {currentBudget?.name || t('component.budgets-menu.not-found')}
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {budgets.map((budget) => (
          <DropdownMenuItem
            key={budget.budgetId}
            asChild
            className="cursor-pointer"
          >
            <Link to={`/budgets/${budget.budgetId}`}>
              {budget.isDefault ? (
                <HeartIcon className="mr-2 size-4" />
              ) : (
                <div className="mr-2 size-4" />
              )}
              {!budget.isOwner && t('component.budgets-menu.shared-budget')}{' '}
              {budget.name}
            </Link>
          </DropdownMenuItem>
        ))}
        {budgets.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/budgets/invitations">
            <ShieldIcon className="mr-2 size-4" />
            <span>{t('component.budgets-menu.invitations')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/budgets/new">
            <PlusIcon className="mr-2 size-4" />
            <span>{t('component.budgets-menu.create')}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
