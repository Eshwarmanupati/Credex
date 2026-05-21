import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-safe share slug for audit reports.
 * 8 characters gives ~2.8 trillion combinations — more than enough.
 */
export function generateShareSlug(): string {
  return nanoid(8);
}

/**
 * Format a number as USD currency string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as a percentage string.
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate the public URL for a shared audit report.
 */
export function getReportUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/report/${slug}`;
}
