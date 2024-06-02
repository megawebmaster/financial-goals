import type { ReactNode } from 'react';
import type { HTMLFormMethod } from '@remix-run/router';
import { useSubmit } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { useTranslation } from 'react-i18next';

type ConfirmationFormProps = {
  action: string;
  children: ReactNode;
  confirmation?: string;
  method?: HTMLFormMethod;
};

export function ConfirmationForm({
  action,
  children,
  confirmation,
  method,
}: ConfirmationFormProps) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const handleConfirm = () => {
    submit({}, { action, method });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">{children}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('component.confirmation-form.title')}</DialogTitle>
          <DialogDescription>
            {t('component.confirmation-form.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('component.confirmation-form.cancel')}
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            {confirmation || t('component.confirmation-form.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
