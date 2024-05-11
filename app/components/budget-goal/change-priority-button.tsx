import type { FormEvent, ReactNode } from 'react';

type ChangePriorityButtonProps = {
  children: ReactNode;
  goalId: number;
  priority: number;
  onPriorityChange: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChangePriorityButton({
  children,
  goalId,
  priority,
  onPriorityChange,
}: ChangePriorityButtonProps) {
  return (
    <form onSubmit={onPriorityChange}>
      <input type="hidden" name="goalId" value={goalId} />
      <input type="hidden" name="priority" value={priority} />
      <button type="submit">{children}</button>
    </form>
  );
}
