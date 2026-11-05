/**
 * Delivery-address JSON helpers.
 *
 * `profiles.address` is a free-form `jsonb` column shared with the web app.
 * The web app reads either a single object or an array of objects shaped like
 * `{ id, label, lat, lng, formatted? }` (see `client/src/components/cart/Cart.tsx`).
 * We keep that exact shape and never change the schema.
 */

export type SavedAddress = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  formatted?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toAddress(value: unknown, index: number): SavedAddress | null {
  if (!isRecord(value)) return null;

  const lat = toNumber(value.lat);
  const lng = toNumber(value.lng);
  if (lat === null || lng === null) return null;

  const id = typeof value.id === 'string' && value.id.trim() !== '' ? value.id : String(index);

  const label =
    typeof value.label === 'string' && value.label.trim() !== ''
      ? value.label
      : `Address ${index + 1}`;

  // Older rows may only have `street`, while the web map picker writes
  // `formatted`. Both are displayed as the human-readable line.
  const formattedSource =
    typeof value.formatted === 'string'
      ? value.formatted
      : typeof value.street === 'string'
        ? value.street
        : null;

  const address: SavedAddress = { id, label, lat, lng };
  if (formattedSource && formattedSource.trim() !== '') {
    address.formatted = formattedSource;
  }

  return address;
}

/**
 * Parses `profiles.address` in any of the shapes produced by the web app:
 * a JSON string, a single object, or an array of objects.
 */
export function parseAddresses(raw: unknown): SavedAddress[] {
  let value = raw;

  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }

  if (value === null || value === undefined) return [];

  const list = Array.isArray(value) ? value : [value];

  return list
    .map((entry, index) => toAddress(entry, index))
    .filter((entry): entry is SavedAddress => entry !== null);
}

/**
 * Persists a single object when there is exactly one address and an array
 * otherwise — the two shapes the web cart understands.
 */
export function serializeAddresses(addresses: SavedAddress[]): SavedAddress | SavedAddress[] {
  return addresses.length === 1 ? addresses[0] : addresses;
}

/** Stable-enough client id for a newly added address. */
export function createAddressId(): string {
  return `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Human-readable one-liner for lists and summaries. */
export function formatAddress(address: SavedAddress): string {
  if (address.formatted && address.formatted.trim() !== '') {
    return address.formatted;
  }
  return `${address.lat.toFixed(4)}, ${address.lng.toFixed(4)}`;
}
