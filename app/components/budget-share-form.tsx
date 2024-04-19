import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

type BudgetShareFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const BudgetShareForm = ({ onSubmit }: BudgetShareFormProps) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="username">
        {t('component.budget-share-form.username')}
      </label>
      <input
        id="username"
        defaultValue=""
        name="username"
        type="email"
        autoComplete="off"
      />
      <button type="submit">{t('component.budget-share-form.submit')}</button>
    </form>
  );
};
