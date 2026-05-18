import {clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Merges Tailwind classes with conflict resolution.
 * Used by every shadcn component for its `cn(...)` calls.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
