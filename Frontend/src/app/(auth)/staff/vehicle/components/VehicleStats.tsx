import { Car, TrendingUp, DollarSign } from 'lucide-react';

export default function VehicleStats({
  totalModels,
  totalBrands,
  avgPrice,
}: {
  totalModels: number;
  totalBrands: number;
  avgPrice: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Stat
        title="Total Models"
        value={totalModels}
        icon={<Car className="w-8 h-8" />}
        color="blue"
      />
      <Stat
        title="Total Brands"
        value={totalBrands}
        icon={<TrendingUp className="w-8 h-8" />}
        color="purple"
      />
      <Stat
        title="Avg Price"
        value={`$${avgPrice}/day`}
        icon={<DollarSign className="w-8 h-8" />}
        color="amber"
      />
    </div>
  );
}

function Stat({ title, value, icon, color }: any) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    amber: 'from-amber-50 to-amber-100 border-amber-200',
    green: 'from-green-50 to-green-100 border-green-200',
    red: 'from-red-50 to-red-100 border-red-200',
    gray: 'from-gray-50 to-gray-100 border-gray-200',
  };

  const iconColor: Record<string, string> = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
    green: 'text-green-500',
    red: 'text-red-500',
    gray: 'text-gray-500',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color || 'gray']} border rounded-xl p-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={iconColor[color || 'gray']}>{icon}</div>
      </div>
    </div>
  );
}
