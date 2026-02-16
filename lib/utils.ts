import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseOffsetFromUrl(url: string): number {
  try {
    const urlObj = new URL(url);
    return Number(urlObj.searchParams.get('page[offset]') ?? 0);
  } catch {
    return 0;
  }
}

export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | 'ellipsis')[] = [];

  pages.push(0);

  if (currentPage > 2) pages.push('ellipsis');

  for (
    let i = Math.max(1, currentPage - 1);
    i <= Math.min(totalPages - 2, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }

  if (currentPage < totalPages - 3) pages.push('ellipsis');

  pages.push(totalPages - 1);

  return pages;
}

export function bearingToDirection(bearing: number | null): string {
  if (bearing === null) return '—';
  const d = bearing % 360;
  if (d < 22.5 || d >= 337.5) return `${Math.round(bearing)}° (N)`;
  if (d < 67.5) return `${Math.round(bearing)}° (NE)`;
  if (d < 112.5) return `${Math.round(bearing)}° (E)`;
  if (d < 157.5) return `${Math.round(bearing)}° (SE)`;
  if (d < 202.5) return `${Math.round(bearing)}° (S)`;
  if (d < 247.5) return `${Math.round(bearing)}° (SW)`;
  if (d < 292.5) return `${Math.round(bearing)}° (W)`;
  return `${Math.round(bearing)}° (NW)`;
}