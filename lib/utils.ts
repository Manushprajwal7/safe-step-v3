import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes intelligently.
 * Ensures 'clsx' and 'tailwind-merge' are direct imports so dependencies are inferred.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
