import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  showIcon?: boolean;
}

export function PaymentStatusBadge({ status, showIcon = true }: PaymentStatusBadgeProps) {
  const statusConfig = {
    PAID: {
      variant: 'default' as const,
      icon: CheckCircle,
      label: 'Paid',
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    PENDING: {
      variant: 'secondary' as const,
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    CANCELLED: {
      variant: 'destructive' as const,
      icon: XCircle,
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
    },
    EXPIRED: {
      variant: 'secondary' as const,
      icon: AlertCircle,
      label: 'Expired',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
