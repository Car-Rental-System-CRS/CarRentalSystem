'use client';

import { useState, useMemo, useEffect } from 'react';
import { VehicleModel } from '@/types/vehicle';
import { carTypeApi, carBrandApi, carApi, Brand } from '@/services/vehicleService';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Fuel, Calendar, Loader2 } from 'lucide-react';
import { BookingCart } from '@/components/BookingCart';
import { toast } from 'sonner';
import { useSessionStatus } from '@/components/SessionProvider';
import { getServerUrl } from '@/lib/utils';

export default function VehicleListings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSeats, setSelectedSeats] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [priceRange, setPriceRange] = useState<string>('all');
  
  // API data
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(true);
  const { status } = useSessionStatus();

  useEffect(() => {
    // Wait for session to load before making API calls
    if (status === 'loading') {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch brands and car types (car types now include features)
        const [brandsRes, carTypesRes, carsRes] = await Promise.all([
          carBrandApi.getAll({ size: 100 }),
          carTypeApi.getAll({ size: 100 }),
          carApi.getAll({ size: 1000 }),
        ]);

        setBrands(brandsRes.data.items);

        // Map car types to VehicleModel format
        const vehiclesData: VehicleModel[] = carTypesRes.data.items.map((carType: any) => {
          const carsForType = carsRes.data.items.filter((car: any) => car.typeId === carType.id);
          
          return {
            id: carType.id,
            carName: carType.name,
            brandId: carType.carBrand.id,
            brandName: carType.carBrand.name,
            numberOfSeats: carType.numberOfSeats,
            consumption: `${carType.consumptionKwhPerKm} kWh/km`,
            pricePerDay: carType.price,
            description: carType.description,
            quantity: carType.carQuantity,
            featureIds: carType.features?.map((f: any) => f.id) || [],
            features: carType.features || [],
            units: carsForType.map((car: any) => ({
              carId: car.id,
              license: car.licensePlate,
              importDate: car.importDate,
            })),
            image: carType.mediaFiles?.[0]?.fileUrl,
            images: carType.mediaFiles?.map((mf: any) => mf.fileUrl) || [],
          } as VehicleModel;
        });

        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load vehicles', {
          description: 'Please try refreshing the page',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = vehicles.filter((vehicle) => {
      // Search filter
      const matchesSearch = vehicle.carName.toLowerCase().includes(searchQuery.toLowerCase());

      // Brand filter
      const matchesBrand = selectedBrand === 'all' || vehicle.brandId === selectedBrand;

      // Seats filter
      const matchesSeats = selectedSeats === 'all' || vehicle.numberOfSeats === parseInt(selectedSeats);

      // Price range filter
      let matchesPrice = true;
      if (priceRange === 'budget') matchesPrice = vehicle.pricePerDay < 60;
      else if (priceRange === 'mid') matchesPrice = vehicle.pricePerDay >= 60 && vehicle.pricePerDay < 100;
      else if (priceRange === 'premium') matchesPrice = vehicle.pricePerDay >= 100;

      return matchesSearch && matchesBrand && matchesSeats && matchesPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.pricePerDay - b.pricePerDay;
        case 'price-high':
          return b.pricePerDay - a.pricePerDay;
        case 'seats':
          return b.numberOfSeats - a.numberOfSeats;
        case 'name':
        default:
          return a.carName.localeCompare(b.carName);
      }
    });

    return filtered;
  }, [vehicles, searchQuery, selectedBrand, selectedSeats, sortBy, priceRange]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Our Vehicle Fleet</h1>
          <p className="text-muted-foreground">Find the perfect vehicle for your journey</p>
        </div>
        <BookingCart />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Brand Filter */}
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Seats Filter */}
        <Select value={selectedSeats} onValueChange={setSelectedSeats}>
          <SelectTrigger>
            <SelectValue placeholder="All Seats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seats</SelectItem>
            <SelectItem value="5">5 Seats</SelectItem>
            <SelectItem value="7">7 Seats</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Range */}
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="All Prices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="budget">Budget (&lt;$60)</SelectItem>
            <SelectItem value="mid">Mid-Range ($60-$100)</SelectItem>
            <SelectItem value="premium">Premium ($100+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort and Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedVehicles.length} of {vehicles.length} vehicles
        </p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="price-low">Price (Low to High)</SelectItem>
            <SelectItem value="price-high">Price (High to Low)</SelectItem>
            <SelectItem value="seats">Seats (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle Grid */}
      {filteredAndSortedVehicles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold mb-2">No vehicles found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                {vehicle.image ? (
                  <div className="aspect-[4/3] relative">
                    <img
                      src={getServerUrl() + vehicle.image}
                      alt={vehicle.carName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    <span className="text-6xl">🚗</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="mb-2">
                    {vehicle.brandName}
                  </Badge>
                  <h3 className="font-bold text-lg mb-1">{vehicle.carName}</h3>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{vehicle.numberOfSeats} Seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    <span>{vehicle.consumption}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {vehicle.features
                    .slice(0, 3)
                    .map((feature) => (
                      <Badge key={feature.id} variant="outline" className="text-xs">
                        {feature.name}
                      </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold">${vehicle.pricePerDay}</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/vehicles/${vehicle.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
