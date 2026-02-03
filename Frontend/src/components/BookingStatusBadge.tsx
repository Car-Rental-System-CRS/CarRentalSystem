import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface BookingStatusBadgeProps {
  status: string;
  showIcon?: boolean;
}

export function BookingStatusBadge({ status, showIcon = true }: BookingStatusBadgeProps) {
  const statusConfig: Record<string, {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: any;
    className?: string;
  }> = {
    PENDING: {
      variant: 'secondary',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    CONFIRMED: {
      variant: 'default',
      icon: CheckCircle,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    },
    ACTIVE: {
      variant: 'default',
      icon: Calendar,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    COMPLETED: {
      variant: 'secondary',
      icon: CheckCircle,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    },
    CANCELLED: {
      variant: 'destructive',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
    },
  };

  const config = statusConfig[status.toUpperCase()] || {
    variant: 'outline' as const,
    icon: Clock,
    className: '',
  };

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {status}
    </Badge>
  );
}
