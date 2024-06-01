import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';

import { cn } from '~/lib/utils';

export function PageNavLink({ className, children, ...props }: LinkProps) {
  // TODO: Add support for active links
  return (
    <Link
      className={cn(
        'flex items-center gap-2 text-md font-normal text-nowrap md:text-base',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}