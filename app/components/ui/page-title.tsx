import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

type PageTitleProps = {
  children: ReactNode;
  className?: string;
};

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <div className={cn('mx-auto grid w-full max-w-6xl gap-2', className)}>
      <h1 className="text-3xl font-semibold">{children}</h1>
    </div>
  );
}
