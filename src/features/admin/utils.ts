import type { DeliveryRequestStatus, OrderStatus } from '@/types/models';
import {
  DELIVERY_REQUEST_STATUS_LABEL,
  DELIVERY_REQUEST_STATUS_TONE,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  isOrderStatus,
} from '@/types/models';
import type { BadgeTone } from '@/components/ui';

import type { AdminOrderStatus } from './types';

/** Euro amounts, exactly like the web app's `numeric` columns. */
export function formatCurrency(value: number | null | undefined): string {
  return `€${(value ?? 0).toFixed(2)}`;
}

/** Compact chart label, e.g. `€10.8k`. */
export function formatCompactEuro(value: number): string {
  return `€${(value / 1000).toFixed(1)}k`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Extracts a human-readable message from a service error.
 *
 * The service layer throws normalised `ServiceError` instances (an `Error`
 * subclass), so the previous `error.message` reads keep working unchanged.
 */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

/** `ORD-XXXXXXXX`, matching the web order manager's short reference. */
export function orderReference(id: string | null | undefined): string {
  if (!id) return 'ORD-UNKNOWN';
  return `ORD-${id.split('-')[0].toUpperCase()}`;
}

export function shortId(id: string | null | undefined, length = 8): string {
  if (!id) return '—';
  return id.length > length ? `${id.slice(0, length)}…` : id;
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return '?';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

type AddressLike = {
  address?: unknown;
  formatted?: unknown;
  street?: unknown;
  label?: unknown;
};

/**
 * Renders the delivery address JSON. The web app falls back to "latitude and
 * longitude only" when no street string exists; we keep that rule.
 */
export function formatAddress(value: Record<string, unknown> | null | undefined): string {
  if (!value) return 'No delivery address';
  const address = value as AddressLike;
  const candidates = [address.address, address.formatted, address.street, address.label];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  if (typeof value.lat === 'number' && typeof value.lng === 'number') {
    return 'Latitude and longitude provided only';
  }

  return 'No delivery address';
}

export function statusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  return isOrderStatus(status) ? ORDER_STATUS_LABEL[status] : status;
}

export function statusTone(status: string | null | undefined): BadgeTone {
  if (!status) return 'neutral';
  return isOrderStatus(status) ? ORDER_STATUS_TONE[status] : 'neutral';
}

export function requestStatusLabel(status: DeliveryRequestStatus): string {
  return DELIVERY_REQUEST_STATUS_LABEL[status];
}

export function requestStatusTone(status: DeliveryRequestStatus): BadgeTone {
  return DELIVERY_REQUEST_STATUS_TONE[status];
}

/** Keeps a progress-bar percentage inside 0–100. */
export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function orderStatusLabel(status: AdminOrderStatus | string | null | undefined): string {
  const orderStatus: OrderStatus = isOrderStatus(status ?? '')
    ? (status as OrderStatus)
    : 'pending';
  return ORDER_STATUS_LABEL[orderStatus] ?? 'Unknown';
}
