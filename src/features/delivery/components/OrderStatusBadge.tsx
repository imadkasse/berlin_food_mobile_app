import { Badge } from '@/components/ui';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/types/models';
import { resolveOrderStatus } from '../lib/format';

/** Status pill for orders, reusing the shared label/tone maps. */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: string | null;
  className?: string;
}) {
  const resolved = resolveOrderStatus(status);

  return (
    <Badge tone={ORDER_STATUS_TONE[resolved]} className={className}>
      {ORDER_STATUS_LABEL[resolved]}
    </Badge>
  );
}
