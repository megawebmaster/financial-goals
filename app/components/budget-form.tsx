import type { FormEvent } from 'react';
import type { BudgetUser } from '@prisma/client';

type BudgetFormProps = {
  budget?: BudgetUser;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submit: string;
};

export const BudgetForm = ({ budget, onSubmit, submit }: BudgetFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="name">Budget name</label>
      <input id="name" defaultValue={budget?.name} name="name" type="text" />
      <button type="submit">{submit}</button>
    </form>
  );
};
