import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { storeKeyMaterial } from '~/services/encryption.client';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

const loginFormSchema = z.object({
  email: z.string().min(4).max(64),
  password: z.string().min(4),
});

type LoginFormProps = {
  referer?: string;
};

export function LoginForm({ referer = '' }: LoginFormProps) {
  const { t } = useTranslation();
  const submit = useSubmit();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    await storeKeyMaterial(values.password);
    submit({ ...values, referer }, { method: 'post', action: '/login' });
  };

  return (
    <Form {...form}>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t('component.login-form.title')}
          </CardTitle>
          <CardDescription>
            {t('component.login-form.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.login-form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="email"
                      type="email"
                      placeholder={t('component.login-form.email-placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.login-form.password')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="password"
                      type="password"
                      placeholder={t(
                        'component.login-form.password-placeholder',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {t('component.login-form.submit')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('component.login-form.register.description')}{' '}
            <Link to="/signup" className="underline">
              {t('component.login-form.register.action')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}
