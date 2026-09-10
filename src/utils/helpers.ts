import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK')}`;
}

export function calculateWeightClass(weight: number): string {
  if (!weight || weight <= 0) return 'Catchweight';
  if (weight < 52.5) return 'Strawweight (< 52kg)';
  if (weight < 56.7) return 'Flyweight (53-57kg)';
  if (weight < 61.2) return 'Bantamweight (57-61kg)';
  if (weight < 65.8) return 'Featherweight (61-66kg)';
  if (weight < 70.3) return 'Lightweight (66-70kg)';
  if (weight < 77.1) return 'Welterweight (70-77kg)';
  if (weight < 83.9) return 'Middleweight (77-84kg)';
  if (weight < 93.0) return 'Light Heavyweight (84-93kg)';
  return 'Heavyweight (93kg+)';
}

export function getRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recently';
  }
}
