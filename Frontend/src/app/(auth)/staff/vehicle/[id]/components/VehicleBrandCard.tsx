export default function VehicleBrandCard({
  brandName,
  brandId,
}: {
  brandName: string;
  brandId: number;
}) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">Brand Information</h2>
      <p className="text-sm text-gray-500">Manufacturer</p>
      <p className="text-xl font-bold">{brandName}</p>
      <p className="text-sm text-gray-500 mt-1">Brand ID: {brandId}</p>
    </div>
  );
}
