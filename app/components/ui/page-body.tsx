import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

type PageBodyProps = {
  children: ReactNode;
  className?: string;
};

export function PageBody({ children, className }: PageBodyProps) {
  return (
    <main
      className={cn(
        'min-h-[calc(100vh_-_theme(spacing.16))] bg-muted/40 p-4 md:gap-8 md:p-10',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl flex flex-1 flex-col gap-4">
        {children}
      </div>
    </main>
  );
}
