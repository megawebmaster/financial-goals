import type { ReactNode } from 'react';

type PageUserNavProps = {
  children?: ReactNode;
};

export function PageUserNav({ children }: PageUserNavProps) {
  return (
    <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
      {children}
    </div>
  );
}
