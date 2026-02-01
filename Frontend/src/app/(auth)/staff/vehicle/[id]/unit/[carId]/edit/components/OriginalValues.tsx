export default function OriginalValues({
  unit,
}: {
  unit: {
    license: string;
    importDate: string;
    gpsId?: string;
  };
}) {
  return (
    <div className="bg-gray-50 border rounded-xl p-6">
      <h3 className="font-semibold mb-3">Original Values</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <Value label="License Plate" value={unit.license} />
        <Value label="Import Date" value={unit.importDate} />
        <Value label="GPS ID" value={unit.gpsId || 'None'} />
      </div>
    </div>
  );
}

function Value({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
