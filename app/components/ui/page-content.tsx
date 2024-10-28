import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type PageContentProps = {
  children: ReactNode;
  className?: string;
};

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={twMerge('grid items-start gap-6', className)}>
      {children}
    </div>
  );
}
