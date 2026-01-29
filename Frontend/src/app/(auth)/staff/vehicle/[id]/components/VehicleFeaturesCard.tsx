import { CheckCircle } from 'lucide-react';

export default function VehicleFeaturesCard({
  features,
}: {
  features: string[];
}) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">Features & Specifications</h2>

      {features.length === 0 ? (
        <p className="text-gray-500 text-sm">No features configured</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((f) => (
            <div
              key={f}
              className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
