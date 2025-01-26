import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

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
import { useNavigationDelay } from '~/hooks/useNavigationDelay';

const signupFormSchema = z.object({
  username: z.string().min(1).max(64),
  email: z.string().min(4).max(64).email(),
  password: z.string().min(12),
});

export function SignupForm() {
  const { t } = useTranslation();
  const submit = useSubmit();
  const loading = useNavigationDelay();

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof signupFormSchema>) => {
    await storeKeyMaterial(values.password);
    submit(values, { method: 'post', action: '/signup' });
  };

  return (
    <Form {...form}>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t('component.signup-form.title')}
          </CardTitle>
          <CardDescription>
            {t('component.signup-form.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            method="post"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.signup-form.user-name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="name"
                      placeholder={t(
                        'component.signup-form.user-name-placeholder',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{t('component.signup-form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="email"
                      type="email"
                      placeholder={t('component.signup-form.email-placeholder')}
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
                  <FormLabel>{t('component.signup-form.password')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="password"
                      type="password"
                      placeholder={t(
                        'component.signup-form.password-placeholder',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('component.signup-form.submit')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t('component.signup-form.login.description')}{' '}
            <Link to="/" className="underline">
              {t('component.signup-form.login.action')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}
