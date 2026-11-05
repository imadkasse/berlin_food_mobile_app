/** Shared client-side validation for the auth + onboarding forms. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();

  if (!email) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';

  return null;
}

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `Enter your ${label}.`;
}

export function validatePassword(value: string, minimum = 8): string | null {
  if (!value) return 'Enter a password.';
  if (value.length < minimum) return `Use at least ${minimum} characters.`;

  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): string | null {
  if (!confirmation) return 'Confirm your password.';
  if (password !== confirmation) return 'The passwords do not match.';

  return null;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15;
}

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

/** Parses a latitude/longitude string, accepting a comma decimal separator. */
export function parseCoordinate(value: string): number {
  return Number.parseFloat(value.trim().replace(',', '.'));
}
