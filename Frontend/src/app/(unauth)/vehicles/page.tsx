import { Metadata } from 'next';
import VehicleListings from './components/VehicleListings';
import ChatWidget from '../components/ChatWidget';

export const metadata: Metadata = {
  title: 'Vehicle Rental - Browse Our Fleet',
  description:
    'Browse and rent from our wide selection of quality vehicles. Find the perfect car for your journey.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Vehicle Rental - Browse Our Fleet',
    description: 'Browse and rent from our wide selection of quality vehicles.',
  },
};

export default function VehiclesPage() {
  return (
    <div>
      <VehicleListings />
      <ChatWidget />
    </div>
  );
}
