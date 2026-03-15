// components/carsSection.tsx
import Link from 'next/link';
import { Car, Users, Fuel, Shield, Building2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { carTypeService } from '@/services/carTypeService';
import { getServerUrl } from '@/lib/utils';
import { CarType } from '@/types/carType';

type HomeCarCard = {
  id: string;
  title: string;
  brand: string;
  seats: number;
  consumptionKwhPerKm: number;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

const mapCarTypeToCard = (carType: CarType): HomeCarCard => ({
  id: carType.id,
  title: carType.name,
  brand: carType.carBrand?.name ?? 'Unknown Brand',
  seats: carType.numberOfSeats,
  consumptionKwhPerKm: carType.consumptionKwhPerKm,
  price: carType.price,
  quantity: carType.carQuantity ?? 0,
  imageUrl: carType.mediaFiles?.[0]?.fileUrl ?? null,
});

const resolveImageUrl = (imageUrl: string): string => {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return `${getServerUrl()}${imageUrl}`;
};

async function getHomeCarTypes(): Promise<HomeCarCard[]> {
  try {
    const response = await carTypeService.getAll({
      page: 0,
      size: 8,
      sort: 'price,asc',
    });

    const carTypes = response.data.data.items;
    return carTypes.map(mapCarTypeToCard);
  } catch (error) {
    console.error('Failed to fetch home car types:', error);
    return [];
  }
}

export default async function CarsSection() {
  const cars = await getHomeCarTypes();

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
                {car.imageUrl ? (
                  <img
                    src={resolveImageUrl(car.imageUrl)}
                    alt={car.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    <Car className="w-14 h-14 text-neutral-400" />
                  </div>
                )}

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
                    Available: {car.quantity}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                  {car.title}
                </h3>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1 text-blue-500" /> {car.brand}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-green-500" /> {car.seats} seats
                  </div>
                  <div className="flex items-center">
                    <Fuel className="w-4 h-4 mr-1 text-orange-500" />
                    {car.consumptionKwhPerKm} kWh/km
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <Layers className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm truncate">Car type</span>
                </div>

                <div className="mb-6">
                  <div className="text-2xl font-bold text-gray-900">
                    ${car.price}
                    <span className="text-sm text-gray-500">/day</span>
                  </div>
                </div>

                <Link href={`/vehicles/${car.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold transition-colors">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {cars.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Unable to load car types right now. Please try again later.
          </div>
        )}

        {/* View More */}
        <div className="text-center mt-16">
          <Link href="/vehicles">
            <Button
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg font-semibold rounded-xl transition-colors"
            >
              View More Cars
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
