import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import type { ClientBudgetGoal } from '~/helpers/budget-goals';
import {
  Form,
  FormControl,
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
import { Button } from '~/components/ui/button';
import { useNavigationDelay } from '~/hooks/useNavigationDelay';

const goalFormSchema = z.object({
  goalName: z.string().min(1).max(64),
  goalAmount: z.coerce.number().min(0),
});

export type BudgetGoalFormValues = z.infer<typeof goalFormSchema>;

type BudgetGoalFormProps = {
  children?: ReactNode;
  className?: string;
  goal?: ClientBudgetGoal;
  onSubmit: (values: BudgetGoalFormValues) => void;
  status: 'create' | 'update';
};

export const BudgetGoalForm = ({
  children,
  className,
  goal,
  onSubmit,
  status,
}: BudgetGoalFormProps) => {
  const { t } = useTranslation();
  const loading = useNavigationDelay();

  // TODO: Properly ask about currency of the budget
  const FORMAT_CURRENCY = { currency: 'PLN', locale: 'pl-PL' };

  const form = useForm<BudgetGoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      goalName: goal?.name || '',
      goalAmount: goal?.requiredAmount,
    },
  });

  return (
    <Form {...form}>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t(`component.goal-form.${status}.title`)}
          </CardTitle>
          <CardDescription>
            {t(`component.goal-form.${status}.description`)}
          </CardDescription>
        </CardHeader>
        <CardContent className={className}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="goalName"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.goal-form.name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('component.goal-form.name-placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="goalAmount"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>
                    {t('component.goal-form.required-amount')}
                  </FormLabel>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step={0.01}
                        min={0}
                        placeholder={t(
                          'component.goal-form.required-amount-placeholder',
                        )}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <p>{FORMAT_CURRENCY.currency}</p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t(`component.goal-form.${status}.submit`)}
            </Button>
          </form>
          {children}
        </CardContent>
      </Card>
    </Form>
  );
};
