import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fungsi sakti buat gabungin class Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
