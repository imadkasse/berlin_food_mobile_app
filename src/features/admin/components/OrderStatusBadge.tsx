import { Badge } from '@/components/ui';

import { statusLabel, statusTone } from '../utils';

export type OrderStatusBadgeProps = {
  status: string | null | undefined;
};

/** Status pill shared by order cards, details and the status picker. */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>;
}
