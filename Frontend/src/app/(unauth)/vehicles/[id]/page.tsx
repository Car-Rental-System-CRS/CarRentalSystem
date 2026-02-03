import { Metadata } from 'next';

import VehicleDetailClient from './components/VehicleDetailClient';

interface VehicleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: VehicleDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Vehicle Details - Vehicle Rental`,
    description: `View detailed information about this vehicle and book your rental`,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      title: `Vehicle Details - Vehicle Rental`,
      description: `Book this vehicle for your journey`,
    },
  };
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = await params;

  return <VehicleDetailClient vehicleId={id} />;
}
