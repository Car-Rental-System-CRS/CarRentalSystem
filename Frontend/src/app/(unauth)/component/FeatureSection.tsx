// components/featuresSection.tsx
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/Card';

export default function FeaturesSection() {
  const features = [
    {
      image: 'https://www.mioto.vn/static/media/thue_xe_co_tai_xe.a6f7dc54.svg',
      title: 'Drive safely with Mioto',
      description:
        'Your trip is protected with self-drive rental insurance from MIC & DBV (VNI). Maximum compensation up to 2,000,000 VND in case of incidents.',
      color: 'bg-blue-50 border-blue-100',
      badge: 'Insurance',
    },
    {
      image:
        'https://www.mioto.vn/static/media/dich_vu_thue_xe_tu_lai_hanoi.f177339e.svg',
      title: 'Book with confidence',
      description:
        'No cancellation fee within 1 hour after payment. 100% refund if the car owner cancels within 7 days before the trip.',
      color: 'bg-green-50 border-green-100',
      badge: 'Booking',
    },
    {
      image:
        'https://www.mioto.vn/static/media/cho_thue_xe_tu_lai_tphcm.1e7cb1c7.svg',
      title: 'Simple procedures',
      description:
        'Only chip-based ID card (or Passport) and a valid driver’s license are required to rent a car.',
      color: 'bg-purple-50 border-purple-100',
      badge: 'Documents',
    },
    {
      image:
        'https://www.mioto.vn/static/media/cho_thue_xe_tu_lai_hanoi.735438af.svg',
      title: 'Easy payment',
      description:
        'Multiple payment methods: ATM, Visa cards & e-wallets (Momo, VnPay, ZaloPay).',
      color: 'bg-orange-50 border-orange-100',
      badge: 'Payment',
    },
    {
      image:
        'https://www.mioto.vn/static/media/thue_xe_tu_lai_gia_re_hcm.ffd1319e.svg',
      title: 'Door-to-door delivery',
      description:
        'Car delivery to home/airport... Affordable fee from only 15k VND/km.',
      color: 'bg-pink-50 border-pink-100',
      badge: 'Delivery',
    },
    {
      image:
        'https://www.mioto.vn/static/media/thue_xe_tu_lai_gia_re_hanoi.4035317e.svg',
      title: 'Wide variety of cars',
      description: 'Over 100 car models: Mini, Sedan, CUV, SUV, MPV, Pickup.',
      color: 'bg-cyan-50 border-cyan-100',
      badge: 'Variety',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Why Choose Mioto
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Features that make renting a car on Mioto easier and safer
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`border-2 ${feature.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group`}
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                  {feature.badge}
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-gray-700 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
