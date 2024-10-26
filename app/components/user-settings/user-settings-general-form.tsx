import type { User } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckIcon, ChevronsUpDownIcon, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Button } from '~/components/ui/button';
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

const userSettingsFormSchema = z.object({
  preferredLocale: z.string(),
});

export type UserSettingsGeneralFormValues = z.infer<
  typeof userSettingsFormSchema
>;

type UserSettingsFormProps = {
  onSubmit: (values: UserSettingsGeneralFormValues) => void;
  user: User;
};

type Locale = {
  name: string;
  locale: string;
};
const LOCALES: Locale[] = [
  { name: 'Polska', locale: 'pl-PL' },
  { name: 'USA', locale: 'en-US' },
];

export const UserSettingsGeneralForm = ({
  onSubmit,
  user,
}: UserSettingsFormProps) => {
  const { t } = useTranslation();
  const loading = useNavigationDelay();

  const form = useForm<UserSettingsGeneralFormValues>({
    resolver: zodResolver(userSettingsFormSchema),
    defaultValues: {
      preferredLocale: user.preferredLocale,
    },
  });

  return (
    <Form {...form}>
      <form
        className="grid gap-4 max-w-lg"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name="preferredLocale"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>
                {t('component.user-settings-form.locale.label')}
              </FormLabel>
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
                        ? LOCALES.find(propEq(field.value, 'locale'))?.name
                        : t('component.user-settings-form.locale.placeholder')}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput
                      placeholder={t(
                        'component.user-settings-form.search.placeholder',
                      )}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {t('component.user-settings-form.search.empty')}
                      </CommandEmpty>
                      <CommandGroup>
                        {LOCALES.map((locale) => (
                          <CommandItem
                            value={locale.name}
                            key={locale.locale}
                            onSelect={() => {
                              form.setValue('preferredLocale', locale.locale);
                            }}
                          >
                            <CheckIcon
                              className={twJoin(
                                'mr-2 h-4 w-4',
                                locale.locale === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {locale.name}
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
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {t('component.user-settings-form.submit')}
        </Button>
      </form>
    </Form>
  );
};
