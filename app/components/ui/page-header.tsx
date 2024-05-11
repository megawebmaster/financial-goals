import type { ReactNode } from 'react';

type PageHeaderProps = {
  children?: ReactNode;
};

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {children}
    </header>
  );
}
