'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VehicleModel } from '@/types/vehicle';
import { carTypeApi, carApi } from '@/services/vehicleService';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBooking } from '@/contexts/BookingContext';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
  Users,
  Fuel,
  Calendar,
  Check,
  ArrowLeft,
  ShoppingCart,
  Info,
  Shield,
  Wrench,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSessionStatus } from '@/components/SessionProvider';

interface VehicleDetailClientProps {
  vehicleId: string;
}

export default function VehicleDetailClient({ vehicleId }: VehicleDetailClientProps) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quantity, setQuantity] = useState(1);
  const { addToBooking } = useBooking();
  const { status } = useSessionStatus();

  useEffect(() => {
    // Wait for session to load before making API calls
    if (status === 'loading') {
      return;
    }

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        
        // Fetch car type (includes features now) and cars
        const [carTypeRes, carsRes] = await Promise.all([
          carTypeApi.getById(vehicleId),
          carApi.getByTypeId(vehicleId),
        ]);

        const carType = carTypeRes.data;
        const cars = carsRes.data.items;

        const vehicleData: VehicleModel = {
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
          units: cars.map((car: any) => ({
            carId: car.id,
            license: car.licensePlate,
            importDate: car.importDate,
          })),
          image: carType.mediaFiles?.[0]?.fileUrl,
          images: carType.mediaFiles?.map((mf: any) => mf.fileUrl) || [],
        };

        setVehicle(vehicleData);
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        toast.error('Failed to load vehicle details', {
          description: 'Please try again or go back to the listings',
        });
        setTimeout(() => router.push('/vehicles'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId, router, status]);

  const handleAddToBooking = () => {
    if (!vehicle) return;
    
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a date range');
      return;
    }

    addToBooking(vehicle, dateRange.from, dateRange.to, quantity);
  };

  const calculateTotal = () => {
    if (!vehicle || !dateRange?.from || !dateRange?.to) return 0;
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24));
    return vehicle.pricePerDay * days * quantity;
  };

  const getDays = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading vehicle details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">Vehicle not found</p>
            <Link href="/vehicles">
              <Button>Back to Vehicles</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/vehicles">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicles
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Vehicle Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <Card className="overflow-hidden">
            {vehicle.image ? (
              <div className="aspect-[16/9] relative">
                <img src={vehicle.image} alt={vehicle.carName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[16/9] bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                <span className="text-9xl">🚗</span>
              </div>
            )}
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2">{vehicle.brandName}</Badge>
                  <CardTitle className="text-3xl mb-2">{vehicle.carName}</CardTitle>
                  <p className="text-muted-foreground">Available units: {vehicle.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">${vehicle.pricePerDay}</p>
                  <p className="text-sm text-muted-foreground">per day</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-semibold">{vehicle.numberOfSeats}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Fuel className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Consumption</p>
                    <p className="font-semibold">{vehicle.consumption}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="font-semibold">{vehicle.quantity} units</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Features & Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {vehicle.features?.map((feature) => (
                    <div key={feature.id} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Additional Info */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">
                    <Info className="h-4 w-4 mr-2" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="specifications">
                    <Wrench className="h-4 w-4 mr-2" />
                    Specs
                  </TabsTrigger>
                  <TabsTrigger value="insurance">
                    <Shield className="h-4 w-4 mr-2" />
                    Insurance
                  </TabsTrigger>
                  <TabsTrigger value="terms">
                    <FileText className="h-4 w-4 mr-2" />
                    Terms
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">About this vehicle</h3>
                    <p className="text-muted-foreground">
                      {vehicle.description ||
                        `The ${vehicle.carName} is a ${vehicle.numberOfSeats}-seater vehicle from ${vehicle.brandName} perfect for your journey. With a fuel consumption of ${vehicle.consumption}, this vehicle offers excellent value for money at $${vehicle.pricePerDay} per day.`}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ideal for</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Family trips and vacations</li>
                      <li>Business travel</li>
                      <li>Weekend getaways</li>
                      <li>City and highway driving</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Brand</span>
                      <span className="text-muted-foreground">{vehicle.brandName}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Number of Seats</span>
                      <span className="text-muted-foreground">{vehicle.numberOfSeats}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Fuel Consumption</span>
                      <span className="text-muted-foreground">{vehicle.consumption}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Available Units</span>
                      <span className="text-muted-foreground">{vehicle.quantity}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insurance" className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Insurance Coverage</h3>
                    <p className="text-muted-foreground mb-4">
                      All vehicles come with comprehensive insurance coverage for your peace of mind.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-sm">Collision Damage Waiver (CDW)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-sm">Third Party Liability Insurance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-sm">Theft Protection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-sm">24/7 Roadside Assistance</span>
                      </li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="terms" className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Rental Terms & Conditions</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Minimum rental age: 21 years</li>
                      <li>• Valid driver's license required</li>
                      <li>• Security deposit required at pickup</li>
                      <li>• Fuel policy: Full to Full</li>
                      <li>• Cancellation: Free up to 24 hours before pickup</li>
                      <li>• Late return: Additional day charge applies</li>
                      <li>• Mileage: Unlimited within country</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Book This Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Range Picker */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Rental Period</label>
                <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Select value={quantity.toString()} onValueChange={(val) => setQuantity(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: vehicle.quantity }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'vehicle' : 'vehicles'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing Summary */}
              {dateRange?.from && dateRange?.to && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily rate</span>
                    <span>${vehicle.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Number of days</span>
                    <span>{getDays()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Add to Booking Button */}
              <Button onClick={handleAddToBooking} className="w-full" size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Booking
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You can add multiple vehicles to your booking
              </p>

              {/* Contact Info */}
              <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                <p>Need help? Contact us:</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>📧 support@carrental.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
