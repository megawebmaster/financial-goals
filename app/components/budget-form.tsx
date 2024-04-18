import type { FormEvent } from 'react';
import type { BudgetUser } from '@prisma/client';
import { useTranslation } from 'react-i18next';

type BudgetFormProps = {
  budget?: BudgetUser;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submit: string;
};

export const BudgetForm = ({ budget, onSubmit, submit }: BudgetFormProps) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="name">{t('component.budget-form.name')}</label>
      <input id="name" defaultValue={budget?.name} name="name" type="text" />
      <button type="submit">{submit}</button>
    </form>
  );
};
