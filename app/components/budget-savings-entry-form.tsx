import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useOutletContext } from '@remix-run/react';

import type {
  AuthenticatedLayoutContext,
  ClientBudget,
} from '~/helpers/budgets';
import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { useNavigationDelay } from '~/hooks/useNavigationDelay';

const savingsFormSchema = z.object({
  savingsDate: z.date().max(new Date()),
  savingsAmount: z.coerce.number().min(0),
});

export type BudgetSavingsFormValues = z.infer<typeof savingsFormSchema>;

type BudgetSavingsEntryFormProps = {
  budget: ClientBudget;
  children?: ReactNode;
  className?: string;
  entry?: ClientBudgetSavingsEntry;
  onSubmit: (values: BudgetSavingsFormValues) => void;
  status: 'create' | 'update';
};

export const BudgetSavingsEntryForm = ({
  budget,
  children,
  className,
  entry,
  onSubmit,
  status,
}: BudgetSavingsEntryFormProps) => {
  const { t } = useTranslation();
  const { user } = useOutletContext<AuthenticatedLayoutContext>();
  const loading = useNavigationDelay();
  const FORMAT_CURRENCY = {
    currency: budget.currency,
    locale: user.preferredLocale,
  };

  const form = useForm<BudgetSavingsFormValues>({
    resolver: zodResolver(savingsFormSchema),
    defaultValues: {
      savingsDate: entry ? new Date(entry.date) : undefined,
      savingsAmount: entry?.amount,
    },
  });

  return (
    <Form {...form}>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t(`component.savings-form.${status}.title`)}
          </CardTitle>
          <CardDescription>
            {t(`component.savings-form.${status}.description`)}
          </CardDescription>
        </CardHeader>
        <CardContent className={className}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="savingsDate"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.savings-form.date')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>
                              {t('component.savings-form.date-placeholder')}
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="savingsAmount"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.savings-form.amount')}</FormLabel>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step={0.01}
                        min={0}
                        placeholder={t(
                          'component.savings-form.amount-placeholder',
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
              {t(`component.savings-form.${status}.submit`)}
            </Button>
          </form>
          {children}
        </CardContent>
      </Card>
    </Form>
  );
};
