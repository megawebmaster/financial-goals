import type { ReactNode } from 'react';
import type { SubmitOptions } from '@remix-run/react';
import { useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

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

type ConfirmationFormProps = SubmitOptions & {
  children: ReactNode;
  confirmation?: string;
  className?: string;
  description?: string;
};

export function ConfirmationForm({
  children,
  confirmation,
  className,
  description,
  ...options
}: ConfirmationFormProps) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const handleConfirm = () => {
    submit({}, options);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={className} variant="destructive">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('component.confirmation-form.title')}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
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
