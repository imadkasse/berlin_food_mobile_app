/**
 * Small formatting/error helpers shared by the customer features.
 *
 * Prices in the Supabase `numeric` columns and in the cart store are plain
 * decimals (e.g. `12.5`), exactly like the web app — they are never converted
 * to minor units. The delivery fee is the web app's flat `150`.
 */

/** Formats a decimal price the way the design system previews it. */
export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return '€0.00';
  return `€${value.toFixed(2)}`;
}

/** Extracts a human-readable message from Supabase/PostgREST/JS errors. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

/** "Lena Hoffmann" → "LH"; falls back to a neutral mark. */
export function getInitials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'BF';

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'BF';
}
