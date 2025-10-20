import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const dynamic = "force-dynamic";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
