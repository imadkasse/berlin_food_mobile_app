import type { DeliveryAddress, OrderStatus, VehicleType } from '@/types/models';
import { isOrderStatus } from '@/types/models';

/** Courier commission per delivered order — mirrors the web dashboard. */
export const DELIVERY_COMMISSION_RATE = 0.12;

/** Static average delivery duration shown on the web dashboard. */
export const AVERAGE_DELIVERY_MINUTES = 18;

const VEHICLE_TYPES: VehicleType[] = ['bicycle', 'scooter', 'motorcycle', 'car', 'van'];

export function isVehicleType(value: string | null | undefined): value is VehicleType {
  return value != null && (VEHICLE_TYPES as string[]).includes(value);
}

/** The web app shows `order.id.split("-")[0]` as the visible order number. */
export function shortOrderId(id: string): string {
  const [head] = id.split('-');
  return (head ?? id).toUpperCase();
}

export function formatMoney(value: number | null | undefined): string {
  return `€${(value ?? 0).toFixed(2)}`;
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** 24-hour pickup/creation time, e.g. "18:05". */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Compact German-style date, e.g. "28.10.2026, 16:00". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}, ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function hasCoordinates(address: DeliveryAddress): boolean {
  return address != null && Number.isFinite(address.lat) && Number.isFinite(address.lng);
}

/** "52.5209, 13.4094" — the same coordinate notation used on the web. */
export function formatCoordinates(address: DeliveryAddress): string | null {
  if (!hasCoordinates(address) || address == null) return null;

  return `${address.lat.toFixed(4)}, ${address.lng.toFixed(4)}`;
}

/**
 * Best human-readable destination available. Mirrors the web queue, which
 * prefers the street and otherwise falls back to the raw coordinates.
 */
export function destinationLabel(address: DeliveryAddress): string {
  if (!address) return 'Destination not provided';

  return (
    address.street?.trim() ||
    address.formatted?.trim() ||
    address.label?.trim() ||
    formatCoordinates(address) ||
    'Destination not provided'
  );
}

export function courierInitials(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return 'BF';

  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';

  return `${first}${last}`.toUpperCase() || 'BF';
}

export function resolveOrderStatus(status: string | null): OrderStatus {
  return status != null && isOrderStatus(status) ? status : 'pending';
}

/** Converts unknown thrown values (Postgrest errors are not `Error`s). */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }

  return fallback;
}
