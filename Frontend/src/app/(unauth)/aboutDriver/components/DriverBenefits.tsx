const benefits = [
  { title: 'Stable income', desc: 'Daily trips with guaranteed earnings.' },
  { title: 'Flexible schedule', desc: 'Choose when you want to work.' },
  {
    title: 'Insurance covered',
    desc: 'Accident and liability insurance during trips.',
  },
  {
    title: 'No customer hunting',
    desc: 'We match you with customers automatically.',
  },
  { title: 'Fast payment', desc: 'Weekly payouts to your bank account.' },
  { title: '24/7 support', desc: 'Support team ready whenever you need help.' },
];

export default function DriverBenefits() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why drive with us?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
