import type { ReactNode } from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@remix-run/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import i18nSettings from '~/i18n';

import EnFlag from 'flag-icons/flags/4x3/us.svg?react';
import PlFlag from 'flag-icons/flags/4x3/pl.svg?react';

const FLAGS_MAP: Record<string, ReactNode> = {
  en: <EnFlag />,
  pl: <PlFlag />,
};

export function LanguageMenu() {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm">
          <div className="w-4 mr-1 bg-slate-200">
            {FLAGS_MAP[i18n.language]}
          </div>
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
