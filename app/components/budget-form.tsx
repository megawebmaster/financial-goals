import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckIcon, ChevronsUpDownIcon, Loader2 } from 'lucide-react';

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
import { useNavigationDelay } from '~/hooks/useNavigationDelay';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { twJoin } from 'tailwind-merge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { propEq } from 'ramda';
import type { ClientBudget } from '~/helpers/budgets';

const budgetFormSchema = z.object({
  budgetName: z.string().min(1).max(64),
  budgetCurrency: z.string(),
  isDefault: z.coerce.boolean(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

type BudgetFormProps = {
  budget?: ClientBudget;
  children?: ReactNode;
  className?: string;
  onSubmit: (values: BudgetFormValues) => void;
  status: 'create' | 'update';
};

type Currency = {
  currency: string;
  name: string;
};
const CURRENCIES: Currency[] = [
  { currency: 'PLN', name: 'Polski Złoty' },
  { currency: 'EUR', name: 'Euro' },
];

export const BudgetForm = ({
  budget,
  children,
  className,
  onSubmit,
  status,
}: BudgetFormProps) => {
  const { t } = useTranslation();
  const loading = useNavigationDelay();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      budgetName: budget?.name || '',
      budgetCurrency: budget?.currency || '',
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
              name="budgetCurrency"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.budget-form.currency')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={twJoin(
                            'justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? CURRENCIES.find(propEq(field.value, 'currency'))
                                ?.name
                            : t('component.budget-form.currency.placeholder')}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput
                          placeholder={t(
                            'component.budget-form.currency.search.placeholder',
                          )}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {t('component.budget-form.currency.search.empty')}
                          </CommandEmpty>
                          <CommandGroup>
                            {CURRENCIES.map((currency) => (
                              <CommandItem
                                value={currency.name}
                                key={currency.currency}
                                onSelect={() => {
                                  form.setValue(
                                    'budgetCurrency',
                                    currency.currency,
                                  );
                                }}
                              >
                                <CheckIcon
                                  className={twJoin(
                                    'mr-2 h-4 w-4',
                                    currency.currency === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                {currency.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
              {t(`component.budget-form.${status}.submit`)}
            </Button>
          </form>
          {children}
        </CardContent>
      </Card>
    </Form>
  );
};
