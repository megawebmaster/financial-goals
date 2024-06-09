import type { ReactNode } from 'react';
import { CheckIcon, CircleUser, LogOutIcon, Settings2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@remix-run/react';

import type { User } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import i18nSettings from '~/i18n';

import EnFlag from 'flag-icons/flags/4x3/us.svg?react';
import PlFlag from 'flag-icons/flags/4x3/pl.svg?react';

type UserMenuProps = {
  user: User;
};

const FLAGS_MAP: Record<string, ReactNode> = {
  en: <EnFlag />,
  pl: <PlFlag />,
};

export function UserMenu({ user }: UserMenuProps) {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <CircleUser className="h-5 w-5" />
          <span className="sr-only">{t('component.user-menu.toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>
          {t('component.user-menu.username', { username: user.username })}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/user/settings">
            <Settings2Icon className="size-4 mr-1" />
            {t('component.user-menu.settings')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          {t('component.user-menu.languages')}
        </DropdownMenuLabel>
        {i18nSettings.supportedLngs.map((language) => (
          <DropdownMenuItem key={language} asChild className="cursor-pointer">
            <Link to={`/language/${language}`} reloadDocument className="flex">
              <div className="w-4 mr-1 bg-slate-200">{FLAGS_MAP[language]}</div>
              <span className="flex-1">
                {t(`component.language-menu.${language}`)}
              </span>
              {i18n.language === language && (
                <CheckIcon className="size-4 ml-1" />
              )}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/logout">
            <LogOutIcon className="size-4 mr-1" />
            {t('component.user-menu.logout')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
