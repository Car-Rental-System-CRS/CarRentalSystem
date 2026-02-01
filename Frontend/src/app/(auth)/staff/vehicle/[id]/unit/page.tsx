// app/staff/vehicle/[id]/unit/page.tsx
import { vehicleModels } from '@/data/vehicles';
import { notFound } from 'next/navigation';
import VehicleUnitsClient from './components/VehicleUnitsClient';

export default async function VehicleUnitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vehicle = vehicleModels.find((v) => v.id === Number(id));
  if (!vehicle) return notFound();

  return <VehicleUnitsClient vehicle={vehicle} />;
}
