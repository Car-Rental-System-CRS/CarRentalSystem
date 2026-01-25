const requirements = [
  'Valid driver license (B2 or higher)',
  'At least 2 years driving experience',
  'Clean criminal record',
  'Smartphone with GPS',
  'Professional attitude and good communication',
  'Willing to follow company service standards',
];

export default function DriverRequirements() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Driver requirements
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {requirements.map((req, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow flex items-center gap-3"
            >
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-sm text-gray-700">{req}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
