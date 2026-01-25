// components/rentalStepsSection.tsx
export default function RentalStepsSection() {
  const rentalSteps = [
    {
      step: '01',
      title: 'Book a car on Mioto app/website',
      image:
        'https://www.mioto.vn/static/media/cho_thue_xe_co_taigia_re_tphcm.12455eba.svg',
      description: 'Find and book a car that fits your needs',
    },
    {
      step: '02',
      title: 'Pick up the car',
      image:
        'https://www.mioto.vn/static/media/gia_thue_xe_7cho_tai_tphcm.9455973a.svg',
      description: 'Car delivered to you or pick up at the meeting point',
    },
    {
      step: '03',
      title: 'Start your journey',
      image:
        'https://www.mioto.vn/static/media/gia_thue_xe_7cho_tai_hanoi.0834bed8.svg',
      description: 'Check the car and begin your trip',
    },
    {
      step: '04',
      title: 'Return the car & finish the trip',
      image:
        'https://www.mioto.vn/static/media/gia_thue_xe_4cho_tai_tphcm.9dcd3930.svg',
      description: 'Complete the return process and payment',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            How to Rent a Car
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Just 4 simple steps to experience fast and easy car rental with
            Mioto
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {rentalSteps.map((step) => (
            <div key={step.step} className="relative">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 z-10">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  {step.step}
                </div>
              </div>

              {/* Step Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative line for mobile */}
        <div className="lg:hidden mt-12">
          <div className="flex justify-center">
            <div className="w-64 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
