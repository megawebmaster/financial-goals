import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { ClientBudgetSavingsEntry } from '~/helpers/budget-goals';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { cn } from '~/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '~/components/ui/calendar';

const savingsFormSchema = z.object({
  date: z.date().max(new Date()),
  amount: z.coerce.number().min(0),
});

export type BudgetSavingsFormValues = z.infer<typeof savingsFormSchema>;

type BudgetSavingsEntryFormProps = {
  children?: ReactNode;
  className?: string;
  entry?: ClientBudgetSavingsEntry;
  onSubmit: (values: BudgetSavingsFormValues) => void;
  status: 'create' | 'update';
};

export const BudgetSavingsEntryForm = ({
  children,
  className,
  entry,
  onSubmit,
  status,
}: BudgetSavingsEntryFormProps) => {
  const { t } = useTranslation();

  // TODO: Properly ask about currency of the budget
  const FORMAT_CURRENCY = { currency: 'PLN', locale: 'pl-PL' };

  const form = useForm<BudgetSavingsFormValues>({
    resolver: zodResolver(savingsFormSchema),
    defaultValues: {
      date: entry ? new Date(entry.date) : undefined,
      amount: entry?.amount,
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
              name="date"
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
              name="amount"
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
            <Button type="submit" className="w-full">
              {t(`component.savings-form.${status}.submit`)}
            </Button>
          </form>
          {children}
        </CardContent>
      </Card>
    </Form>
  );
};
