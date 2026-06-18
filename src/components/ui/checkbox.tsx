'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer flex size-5 shrink-0 items-center justify-center rounded border-2 border-muted-foreground/50 bg-background transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary-foreground">
        <CheckIcon className="size-3 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
