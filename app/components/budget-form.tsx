import type { BudgetUser } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import type { ReactNode } from 'react';

const budgetFormSchema = z.object({
  budgetName: z.string().min(1).max(64),
  isDefault: z.coerce.boolean(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

type BudgetFormProps = {
  budget?: BudgetUser;
  children?: ReactNode;
  className?: string;
  onSubmit: (values: BudgetFormValues) => void;
  status: 'create' | 'update';
};

export const BudgetForm = ({
  budget,
  children,
  className,
  onSubmit,
  status,
}: BudgetFormProps) => {
  const { t } = useTranslation();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      budgetName: budget?.name || '',
      isDefault: budget?.isDefault,
    },
  });

  return (
    <Form {...form}>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t(`component.budget-form.${status}.title`)}
          </CardTitle>
          <CardDescription>
            {t(`component.budget-form.${status}.description`)}
          </CardDescription>
        </CardHeader>
        <CardContent className={className}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="budgetName"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.budget-form.name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('component.budget-form.name-placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 gap-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      {t('component.budget-form.is-default')}
                    </FormLabel>
                    <FormDescription className="text-xs">
                      {t('component.budget-form.is-default-description')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {t(`component.budget-form.${status}.submit`)}
            </Button>
          </form>
          {children}
        </CardContent>
      </Card>
    </Form>
  );
};
