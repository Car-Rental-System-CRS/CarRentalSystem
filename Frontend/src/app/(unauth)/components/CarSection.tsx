// components/carsSection.tsx
import { Car, Star, Users, Fuel, MapPin, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

export default function CarsSection() {
  const cars = [
    {
      id: 1,
      discount: '18%',
      badge: 'No Collateral',
      title: 'TESLA MODEL Y 2024',
      transmission: 'Automatic',
      seats: '5 seats',
      fuel: 'Electric',
      location: 'District 1, Ho Chi Minh City',
      rating: 4.9,
      trips: 45,
      originalPrice: '1,250K',
      discountedPrice: '1,025K',
      period: '/day',
      imageUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.Ng8jNWUD9G75JZatll5JGQHaE8%3Fcb%3Ddefcachec2%26pid%3DApi&f=1&ipt=afb368b5f817e18f40d6420671fadb58dae02653f9f2acd6d1d4317a7f00c058&ipo=images',
    },
    {
      id: 2,
      discount: '15%',
      badge: 'No Collateral',
      title: 'VINFAST VF 8 2024',
      transmission: 'Automatic',
      seats: '5 seats',
      fuel: 'Electric',
      location: 'District 3, Ho Chi Minh City',
      rating: 4.8,
      trips: 32,
      originalPrice: '980K',
      discountedPrice: '833K',
      period: '/day',
      imageUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.iEkTA8Mj4iIJoczvWy6j4gHaEo%3Fpid%3DApi&f=1&ipt=9cd027762ecc63dd7281012058367b58751ef10f17cc02d56356dae287f5d031&ipo=images',
    },
    {
      id: 3,
      discount: '20%',
      badge: 'No Collateral',
      title: 'BYD ATTO 3 2024',
      transmission: 'Automatic',
      seats: '5 seats',
      fuel: 'Electric',
      location: 'District 7, Ho Chi Minh City',
      rating: 4.7,
      trips: 38,
      originalPrice: '850K',
      discountedPrice: '680K',
      period: '/day',
      imageUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.63RavvJ2mmu8fYrjnlUONwHaE8%3Fpid%3DApi&f=1&ipt=c18b4fb40519305ca4e8bfba6bb23267078b7e021728adef93bbf52c64d90d0b&ipo=images',
    },
    {
      id: 4,
      discount: '22%',
      badge: 'No Collateral',
      title: 'HYUNDAI IONIQ 5 2024',
      transmission: 'Automatic',
      seats: '5 seats',
      fuel: 'Electric',
      location: 'Thu Duc City, Ho Chi Minh',
      rating: 4.9,
      trips: 41,
      originalPrice: '1,100K',
      discountedPrice: '858K',
      period: '/day',
      imageUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.mTsq5OrHpawm2t0KOC5NAwHaEK%3Fpid%3DApi&f=1&ipt=2e83ab5dc6e1fff9b14bc7d7c680120060eae0042076925a1d3c3097d14cf808&ipo=images',
    },

    // ---- second row ----
    {
      id: 5,
      discount: '17%',
      badge: 'No Collateral',
      title: 'KIA EV6 2024',
      transmission: 'Automatic',
      seats: '5 seats',
      fuel: 'Electric',
      location: 'District 1, Ho Chi Minh City',
      rating: 4.8,
      trips: 29,
      originalPrice: '1,150K',
      discountedPrice: '955K',
      period: '/day',
      imageUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.ZuUqht6F4TWjYU--zKntnQHaEK%3Fcb%3Ddefcache2%26pid%3DApi%26defcache%3D1&f=1&ipt=a9348b7c94a3aef878ac8904764d1db52b0d1f0dcb95fb5c112812dd12d654ce&ipo=images',
    },
    {
      id: 6,
      discount: '19%',
      badge: 'No Collateral',
      title: 'PORSCHE TAYCAN 2024',
      transmission: 'Automatic',
      seats: '4 seats',
      fuel: 'Electric',
      location: 'District 2, Ho Chi Minh City',
      rating: 4.9,
      trips: 22,
      originalPrice: '2,800K',
      discountedPrice: '2,268K',
      period: '/day',
      imageUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.S3yMYp_rZpS3OlKsrBh3CgHaEK%3Fpid%3DApi&f=1&ipt=a43f95a8ea895571595a1a7f3dbba8d4c5706fcc67c0fe69a767b48b364f8631&ipo=images',
    },
    {
      id: 7,
      discount: '16%',
      badge: 'No Collateral',
      title: 'MERCEDES EQS 2024',
      transmission: 'Automatic',
      seats: '5 seats',
      fuel: 'Electric',
      location: 'Binh Thanh District, HCMC',
      rating: 4.9,
      trips: 18,
      originalPrice: '2,500K',
      discountedPrice: '2,100K',
      period: '/day',
      imageUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.Etg_crLDazcCxugu6V2GyAHaEK%3Fpid%3DApi&f=1&ipt=bf97f85f353755b3163b40533c73936340a1a724599be79bd5ed9334f9feecda&ipo=images',
    },
    {
      id: 8,
      discount: '21%',
      badge: 'No Collateral',
      title: 'BMW i4 2024',
      transmission: 'Automatic',
      seats: '5 seats',
      fuel: 'Electric',
      location: 'Tan Binh District, HCMC',
      rating: 4.8,
      trips: 26,
      originalPrice: '1,850K',
      discountedPrice: '1,462K',
      period: '/day',
      imageUrl:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.7NzUFUAbfONBXUJC0TUlwAHaE8%3Fpid%3DApi&f=1&ipt=eaf33d568c283b9d3a97a31610e918d9931a681945d84e108c4251bd41e0ebd5&ipo=images',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Cars For You
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most popular cars with attractive prices
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={car.imageUrl}
                  alt={car.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Discount */}
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Save {car.discount}
                </div>

                {/* Car overlay */}
                <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="mb-4">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
                    <Shield className="w-3 h-3 mr-2" />
                    {car.badge}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                  {car.title}
                </h3>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-blue-500" />{' '}
                    {car.transmission}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-green-500" />{' '}
                    {car.seats}
                  </div>
                  <div className="flex items-center">
                    <Fuel className="w-4 h-4 mr-1 text-orange-500" /> {car.fuel}
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                  <span className="text-sm truncate">{car.location}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                    <span className="font-semibold mr-3">{car.rating}</span>
                    <span className="text-gray-500 text-sm">
                      {car.trips} trips
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {car.discountedPrice}
                    <span className="text-sm text-gray-500">{car.period}</span>
                  </div>
                  <div className="text-sm text-gray-400 line-through">
                    {car.originalPrice}
                    {car.period}
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold transition-colors">
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-16">
          <Button
            variant="outline"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg font-semibold rounded-xl transition-colors"
          >
            View More Cars
          </Button>
        </div>
      </div>
    </section>
  );
}
