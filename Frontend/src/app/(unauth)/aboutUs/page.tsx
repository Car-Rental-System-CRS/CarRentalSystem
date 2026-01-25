import { Metadata } from 'next';

import AboutHero from './components/AboutHero';
import AboutMission from './components/AboutMission';
import AboutStats from './components/AboutStats';
import ServicesSection from '../components/serviceSection';

export const metadata: Metadata = {
  title: 'About Us - Car Rental System',
  description: 'Drive. Explore. Inspire with our car rental platform.',
};

export default function AboutUsPage() {
  return (
    <main className="bg-white">
      <AboutHero />
      <AboutMission />
      <AboutStats />
      <ServicesSection />
    </main>
  );
}
