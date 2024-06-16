import type { ReactNode } from 'react';

type PageContentProps = {
  children: ReactNode;
};

export function PageContent({ children }: PageContentProps) {
  return <div className="grid items-start gap-6">{children}</div>;
}
