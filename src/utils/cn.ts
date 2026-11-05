/**
 * Joins conditional class names. All classes must be statically written where
 * they are used (Tailwind / NativeWind extracts classes from source text), so
 * never build class strings dynamically — pick them from constant maps.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
