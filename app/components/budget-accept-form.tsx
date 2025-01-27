import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import type { BudgetFormValues } from '~/components/budget-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { useNavigationDelay } from '~/hooks/useNavigationDelay';

const budgetAcceptFormSchema = z.object({
  budgetName: z.string().min(1).max(64),
  isDefault: z.coerce.boolean(),
});

export type BudgetAcceptFormValues = z.infer<typeof budgetAcceptFormSchema>;

type BudgetAcceptFormProps = {
  name?: string;
  onSubmit: (values: BudgetAcceptFormValues) => void;
};

export const BudgetAcceptForm = ({
  name = '',
  onSubmit,
}: BudgetAcceptFormProps) => {
  const { t } = useTranslation();
  const loading = useNavigationDelay();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetAcceptFormSchema),
    defaultValues: {
      budgetName: name,
      isDefault: false,
    },
  });

  return (
    <Form {...form}>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t('component.budget-accept-form.title')}
          </CardTitle>
          <CardDescription>
            {t('component.budget-accept-form.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="budgetName"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.budget-form.name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('component.budget-accept-form.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
};
