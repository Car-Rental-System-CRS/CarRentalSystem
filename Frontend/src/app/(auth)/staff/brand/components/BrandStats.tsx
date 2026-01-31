import { BadgeCheck } from 'lucide-react';

export default function BrandStats({ total }: { total: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Stat
        title="Total Brands"
        value={total}
        icon={<BadgeCheck className="w-8 h-8" />}
        color="blue"
      />
    </div>
  );
}

interface StatProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue'; // để mở rộng sau
}

function Stat({ title, value, icon }: StatProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-blue-500">{icon}</div>
      </div>
    </div>
  );
}
