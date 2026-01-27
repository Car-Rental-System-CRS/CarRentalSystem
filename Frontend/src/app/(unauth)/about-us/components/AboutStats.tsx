const stats = [
  { value: '200,000+', label: 'Trips completed' },
  { value: '100,000+', label: 'Happy customers' },
  { value: '10,000+', label: 'Car owners' },
  { value: '100+', label: 'Car models' },
  { value: '20+', label: 'Cities covered' },
  { value: '4.95/5', label: 'Average rating' },
];

export default function AboutStats() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Mioto in Numbers
        </h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-10 text-center">
          {stats.map((item, i) => (
            <div key={i}>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {item.value}
              </p>
              <p className="text-gray-600 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
