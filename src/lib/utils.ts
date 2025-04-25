import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateTime = (timestamp: string | null | undefined): string => {
  if (!timestamp) return "N/A";
  try {
      // Basic check for ISO-like format before parsing
      if (typeof timestamp === 'string' && timestamp.match(/^\d{4}-\d{2}-\d{2}/)) {
          return new Date(timestamp).toLocaleString();
      }
      // If not a recognizable format, return as is or indicate issue
      return "Invalid Date Format";
  } catch (e) {
      console.error("Error formatting date:", timestamp, e);
      return "Invalid Date";
  }
};