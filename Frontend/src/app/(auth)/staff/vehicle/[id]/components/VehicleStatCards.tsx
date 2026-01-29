import { Car, Tag, Users, Fuel, DollarSign } from 'lucide-react';
import { VehicleModel } from '@/data/vehicles';

export default function VehicleStatCards({
  vehicle,
}: {
  vehicle: VehicleModel;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Stat
        title="Daily Rate"
        value={`$${vehicle.pricePerDay}/day`}
        icon={<DollarSign className="w-5 h-5" />}
        color="blue"
      />
      <Stat
        title="Available Units"
        value={vehicle.quantity}
        icon={<Car className="w-5 h-5" />}
        color="green"
      />
      <Stat
        title="Seats"
        value={vehicle.numberOfSeats}
        icon={<Users className="w-5 h-5" />}
        color="purple"
      />
      <Stat
        title="Fuel Consumption"
        value={vehicle.consumption}
        icon={<Fuel className="w-5 h-5" />}
        color="amber"
      />
    </div>
  );
}

function Stat({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray';
}) {
  const colorMap = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      text: 'text-blue-700',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      icon: 'text-green-500',
      text: 'text-green-700',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      icon: 'text-purple-500',
      text: 'text-purple-700',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      text: 'text-amber-700',
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      border: 'border-red-200',
      icon: 'text-red-500',
      text: 'text-red-700',
    },
    gray: {
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      border: 'border-gray-200',
      icon: 'text-gray-500',
      text: 'text-gray-700',
    },
  };

  const colors = colorMap[color || 'gray'];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${colors.text}`}>{value}</p>
        </div>
        {icon && (
          <div className={`${colors.icon} p-2 rounded-full bg-white/50`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
