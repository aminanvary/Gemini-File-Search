import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPersianText(text: string): boolean {
  if (!text) return false;
  // Persian/Arabic Unicode range: \u0600-\u06FF
  const persianRegex = /[\u0600-\u06FF]/;
  // Check if significant portion is Persian
  const persianChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return persianRegex.test(text) && persianChars > text.length * 0.3;
}