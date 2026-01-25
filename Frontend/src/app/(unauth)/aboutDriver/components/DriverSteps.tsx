const steps = [
  {
    title: 'Submit application',
    desc: 'Fill in your personal information and upload documents.',
  },
  {
    title: 'Interview & verification',
    desc: 'We review your profile and contact you for interview.',
  },
  {
    title: 'Start driving',
    desc: 'Activate your account and start receiving trips.',
  },
];

export default function DriverSteps() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          How to become a driver
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <div className="text-green-500 text-3xl font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
