// app/page.tsx
import { Metadata } from 'next';

import HeroSection from './components/HeroSection';
import CarsSection from './components/CarSection';
import FeaturesSection from './components/FeatureSection';
import RentalStepsSection from './components/RentalStepSection';
import AboutSection from './components/AboutSection';

export const metadata: Metadata = {
  title: 'Mioto - Self-drive & Travel Car Rental',
  description:
    'Self-drive and travel car rental service with affordable prices and simple procedures',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Mioto - Self-drive & Travel Car Rental',
    description:
      'Rent 4-seat, 7-seat self-drive and travel cars in Ho Chi Minh City',
    images: ['/og-image.png'],
  },
};

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <CarsSection />
      <FeaturesSection />
      <RentalStepsSection />
      <AboutSection />
    </div>
  );
}
