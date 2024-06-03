import type { FormEvent, ReactNode } from 'react';

import { Button } from '~/components/ui/button';

type ChangePriorityButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  goalId: number;
  priority: number;
  onPriorityChange: (event: FormEvent<HTMLFormElement>) => void;
  title?: string;
};

export function ChangePriorityButton({
  children,
  disabled = false,
  goalId,
  priority,
  onPriorityChange,
  title,
}: ChangePriorityButtonProps) {
  return (
    <form onSubmit={onPriorityChange}>
      <input type="hidden" name="goalId" value={goalId} />
      <input type="hidden" name="priority" value={priority} />
      <Button
        type="submit"
        disabled={disabled}
        variant="outline"
        size="icon"
        title={title}
      >
        {children}
      </Button>
    </form>
  );
}
