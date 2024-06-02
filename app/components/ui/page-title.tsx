import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

type PageTitleProps = {
  children?: ReactNode;
  className?: string;
  title: string;
};

export function PageTitle({ children, className, title }: PageTitleProps) {
  return (
    <div className={cn('mx-auto flex w-full max-w-6xl gap-2', className)}>
      <h1 className="text-3xl flex-1 font-semibold">{title}</h1>
      {children}
    </div>
  );
}
