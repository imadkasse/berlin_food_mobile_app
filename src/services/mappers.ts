/**
 * Narrowing helpers that bridge the database rows (source of truth) and the
 * hand-written domain models in `@/types/models.ts`.
 *
 * The web app performs these casts inline at the call site (e.g.
 * `order.delivery_address as AddressJson | null` in
 * `client/src/components/delivery/ActiveDelivery.tsx`). The mobile app keeps
 * the same shape but centralises the cast here so the UI layer never has to
 * deal with `Json`.
 *
 * Nothing in this module changes business rules — it only re-types values that
 * the database already stores.
 */

import type { DeliveryAddress } from '@/types/models';
import type { Json, OrderRow, ProfileRow } from '@/types/database.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

/**
 * Narrows a `jsonb` column to a `DeliveryAddress`.
 *
 * The web app writes `{ lat, lng }` (plus optional `street` / `label` /
 * `formatted`) into `orders.delivery_address` and `profiles.address`. Rows
 * written before the address picker existed may hold a JSON string, so that
 * shape is parsed as well. Anything that cannot be interpreted resolves to
 * `null` rather than throwing.
 */
export function toDeliveryAddress(value: Json | unknown): DeliveryAddress {
  let raw: unknown = value;

  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  if (!isRecord(raw)) {
    return null;
  }

  const lat = toNumber(raw.lat);
  const lng = toNumber(raw.lng);

  if (lat === null || lng === null) {
    return null;
  }

  const address: Exclude<DeliveryAddress, null> = { lat, lng };

  if (typeof raw.street === 'string' && raw.street.trim() !== '') {
    address.street = raw.street;
  }
  if (typeof raw.label === 'string' && raw.label.trim() !== '') {
    address.label = raw.label;
  }
  if (typeof raw.formatted === 'string' && raw.formatted.trim() !== '') {
    address.formatted = raw.formatted;
  }

  return address;
}

/**
 * Narrows an `orders` row to the domain `Order` model.
 *
 * Only the `delivery_address` column needs narrowing — every other column has
 * the same type in both models.
 */
export function toDomainOrder(order: OrderRow): OrderRow & { delivery_address: DeliveryAddress } {
  return {
    ...order,
    delivery_address: toDeliveryAddress(order.delivery_address),
  };
}

/**
 * Narrows a `profiles` row to the domain `Profile` model.
 *
 * Only the `address` column needs narrowing.
 */
export function toDomainProfile(profile: ProfileRow): ProfileRow & { address: DeliveryAddress } {
  return {
    ...profile,
    address: toDeliveryAddress(profile.address),
  };
}
