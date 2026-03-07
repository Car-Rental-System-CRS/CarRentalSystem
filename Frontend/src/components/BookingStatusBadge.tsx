import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Calendar, PlayCircle } from 'lucide-react';

interface BookingStatusBadgeProps {
  status: string;
  showIcon?: boolean;
}

export function BookingStatusBadge({ status, showIcon = true }: BookingStatusBadgeProps) {
  const statusConfig: Record<string, {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: any;
    className?: string;
    label?: string;
  }> = {
    CREATED: {
      variant: 'secondary',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      label: 'Created',
    },
    PENDING: {
      variant: 'secondary',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      label: 'Pending',
    },
    CONFIRMED: {
      variant: 'default',
      icon: CheckCircle,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      label: 'Confirmed',
    },
    IN_PROGRESS: {
      variant: 'default',
      icon: PlayCircle,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
      label: 'In Progress',
    },
    ACTIVE: {
      variant: 'default',
      icon: Calendar,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
      label: 'Active',
    },
    COMPLETED: {
      variant: 'secondary',
      icon: CheckCircle,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      label: 'Completed',
    },
    CANCELED: {
      variant: 'destructive',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
      label: 'Canceled',
    },
    CANCELLED: {
      variant: 'destructive',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
      label: 'Cancelled',
    },
  };

  const config = statusConfig[status.toUpperCase()] || {
    variant: 'outline' as const,
    icon: Clock,
    className: '',
    label: status,
  };

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label || status}
    </Badge>
  );
}
