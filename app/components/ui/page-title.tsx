import type { ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { ChevronLeftIcon } from 'lucide-react';
import { twJoin } from 'tailwind-merge';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';

type PageTitleProps = {
  back?: string;
  children?: ReactNode;
  className?: string;
  title: string;
};

export function PageTitle({
  back,
  children,
  className,
  title,
}: PageTitleProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {back && (
        <Button
          asChild
          className="text-3xl"
          size="icon"
          variant="ghost"
          onClick={() => window.history.back()}
        >
          <Link to={back}>
            <ChevronLeftIcon />
          </Link>
        </Button>
      )}
      <h1 className={twJoin('text-3xl flex-1 font-semibold', !back && 'ms-4')}>
        {title}
      </h1>
      {children}
    </div>
  );
}
