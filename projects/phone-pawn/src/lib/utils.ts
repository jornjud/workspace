import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, startOfDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRefId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'REF-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function calculateInterest(principal: number, startDate: Date, endDate: Date) {
  // 14% per 7 days -> 2% per day
  // Minimum 20 THB per day
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  let days = differenceInDays(end, start);
  
  if (days <= 0) {
    days = 1; // Minimum 1 day charge
  }
  
  const dailyRate = Math.max((principal * 0.14) / 7, 20);
  return Math.round(dailyRate * days);
}

export const RAM_ROM_OPTIONS = [
  "3GB / 32GB",
  "4GB / 64GB",
  "4GB / 128GB",
  "6GB / 128GB",
  "8GB / 128GB",
  "8GB / 256GB",
  "12GB / 256GB",
  "12GB / 512GB",
  "Other"
];
