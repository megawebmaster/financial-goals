import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useOutletContext } from '@remix-run/react';

import type {
  AuthenticatedLayoutContext,
  ClientBudget,
} from '~/helpers/budgets';
import type { ClientBudgetGoal } from '~/helpers/budget-goals';
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
import { Button } from '~/components/ui/button';
import { useNavigationDelay } from '~/hooks/useNavigationDelay';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

const goalFormSchema = z.object({
  goalName: z.string().min(1).max(64),
  goalType: z.string(),
  goalAmount: z.coerce.number().min(0),
});

export type BudgetGoalFormValues = z.infer<typeof goalFormSchema>;

type BudgetGoalFormProps = {
  budget: ClientBudget;
  children?: ReactNode;
  className?: string;
  goal?: ClientBudgetGoal;
  onSubmit: (values: BudgetGoalFormValues) => void;
  status: 'create' | 'update';
};

type TypeSelectorProps = {
  type: 'quick' | 'long';
};

const TypeSelector = ({ type }: TypeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <FormItem className="border rounded px-4 py-2">
      <FormLabel>
        <div className="flex leading-none items-center grow pb-1">
          <p className="text-lg grow">
            {t(`component.goal-form.type.${type}.title`)}
          </p>
          <FormControl>
            <RadioGroupItem value={type} />
          </FormControl>
        </div>
        <FormDescription className="font-normal whitespace-pre-wrap">
          {t(`component.goal-form.type.${type}.description`)}
        </FormDescription>
      </FormLabel>
    </FormItem>
  );
};

export const BudgetGoalForm = ({
  budget,
  children,
  className,
  goal,
  onSubmit,
  status,
}: BudgetGoalFormProps) => {
  const { t } = useTranslation();
  const loading = useNavigationDelay();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();
  const FORMAT_CURRENCY = {
    currency: budget.currency,
    locale: user.preferredLocale,
  };

  const form = useForm<BudgetGoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      goalName: goal?.name || '',
      goalType: goal?.type || '',
      goalAmount: goal?.requiredAmount,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('component.goal-form.type.title')}
            </CardTitle>
            <CardDescription>
              {t('component.goal-form.type.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              name="goalType"
              render={({ field }) => (
                <>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col gap-6"
                    >
                      <TypeSelector type="quick" />
                      <TypeSelector type="long" />
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </>
              )}
            />
          </CardContent>
        </Card>
        {form.getValues().goalType && (
          <>
            <Card className="w-full my-4">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t('component.goal-form.details.title')}
                </CardTitle>
                <CardDescription>
                  {t(`component.goal-form.${status}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent
                className={twMerge('grid gap-4 max-w-lg mx-auto', className)}
              >
                <FormField
                  name="goalName"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>{t('component.goal-form.name')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t(
                            'component.goal-form.name-placeholder',
                          )}
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
                      <div className="flex w-full items-center space-x-2">
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
                {children}
              </CardContent>
            </Card>
          </>
        )}
      </form>
    </Form>
  );
};
