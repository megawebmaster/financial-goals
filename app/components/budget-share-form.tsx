import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Link } from '@remix-run/react';

const budgetShareFormSchema = z.object({
  email: z.string().min(1).max(64),
});

export type BudgetShareFormValues = z.infer<typeof budgetShareFormSchema>;

type BudgetShareFormProps = {
  budgetId: number;
  onSubmit: (values: BudgetShareFormValues) => void;
};

export const BudgetShareForm = ({
  budgetId,
  onSubmit,
}: BudgetShareFormProps) => {
  const { t } = useTranslation();

  const form = useForm<BudgetShareFormValues>({
    resolver: zodResolver(budgetShareFormSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <Form {...form}>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t('component.budget-share-form.title')}
          </CardTitle>
          <CardDescription>
            {t('component.budget-share-form.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>
                    {t('component.budget-share-form.username')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="off"
                      placeholder={t(
                        'component.budget-share-form.username-placeholder',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {t('component.budget-share-form.submit')}
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to={`/budgets/${budgetId}`}>
                {t('component.budget-share-form.cancel')}
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
};
