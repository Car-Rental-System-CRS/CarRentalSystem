import DriverHero from './components/DriverHero';
import DriverBenefits from './components/DriverBenefits';
import DriverIncomeTable from './components/DriverIncomeTable';
import DriverRequirements from './components/DriverRequirements';
import DriverSteps from './components/DriverSteps';
import DriverCTA from './components/DriverCTA';

export default function AboutDriverPage() {
  return (
    <main className="bg-white">
      <DriverHero />
      <DriverBenefits />
      <DriverIncomeTable />
      <DriverRequirements />
      <DriverSteps />
      <DriverCTA />
    </main>
  );
}
