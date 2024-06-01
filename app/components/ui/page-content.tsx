import type { ReactNode } from 'react';

type PageContentProps = {
  children: ReactNode;
};

export function PageContent({ children }: PageContentProps) {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
      {children}
    </div>
  );
}
