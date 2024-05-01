import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

type BudgetAcceptFormProps = {
  name?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const BudgetAcceptForm = ({
  name = '',
  onSubmit,
}: BudgetAcceptFormProps) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="name">{t('component.budget-accept-form.name')}</label>
      <input
        id="name"
        defaultValue={name}
        name="name"
        type="text"
        autoComplete="off"
      />
      <button type="submit">{t('component.budget-accept-form.submit')}</button>
    </form>
  );
};
