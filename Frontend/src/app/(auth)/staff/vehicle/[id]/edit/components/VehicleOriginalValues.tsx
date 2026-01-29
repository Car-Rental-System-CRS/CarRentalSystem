'use client';

import { VehicleModel } from '@/data/vehicles';

type Props = {
  vehicle: VehicleModel;
};

export default function VehicleOriginalValues({ vehicle }: Props) {
  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-gray-700 mb-2">Original Values</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Model</p>
          <p className="font-medium">{vehicle.carName}</p>
        </div>

        <div>
          <p className="text-gray-500">Brand ID</p>
          <p className="font-medium">{vehicle.brandId}</p>
        </div>

        <div>
          <p className="text-gray-500">Seats</p>
          <p className="font-medium">{vehicle.numberOfSeats}</p>
        </div>

        <div>
          <p className="text-gray-500">Price/Day</p>
          <p className="font-medium">${vehicle.pricePerDay}</p>
        </div>
      </div>
    </div>
  );
}
