'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VehicleModel } from '@/types/vehicle';
import { carTypeApi, carApi, CarAvailabilityResponse } from '@/services/vehicleService';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RentalPeriodPicker } from '@/components/ui/rental-period-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBooking, calculatePricing, MINIMUM_RENTAL_HOURS } from '@/contexts/BookingContext';
import { DateRange } from 'react-day-picker';
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
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSessionStatus } from '@/components/SessionProvider';
import { getServerUrl } from '@/lib/utils';

interface VehicleDetailClientProps {
  vehicleId: string;
}

export default function VehicleDetailClient({ vehicleId }: VehicleDetailClientProps) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [availability, setAvailability] = useState<CarAvailabilityResponse | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const { addToCart } = useBooking();
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

  // Check availability when date range changes
  const checkAvailability = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setAvailability(null);
      setAvailabilityError(null);
      return;
    }

    try {
      setCheckingAvailability(true);
      setAvailabilityError(null);
      
      const response = await carTypeApi.checkAvailability(
        vehicleId,
        dateRange.from,
        dateRange.to
      );
      
      setAvailability(response);
      
      // Reset quantity if it exceeds available count
      if (quantity > response.availableCount) {
        setQuantity(Math.max(1, response.availableCount));
      }
      
      if (response.availableCount === 0) {
        setAvailabilityError('No vehicles available for the selected dates');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError('Failed to check availability. Please try again.');
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  }, [vehicleId, dateRange, quantity]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  // Validate minimum rental period
  const getValidationError = () => {
    if (!dateRange?.from || !dateRange?.to) return null;
    
    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    const hours = duration / (1000 * 3600);
    
    if (hours < MINIMUM_RENTAL_HOURS) {
      return `Minimum rental period is ${MINIMUM_RENTAL_HOURS} hours`;
    }
    
    return null;
  };

  const handleAddToCart = () => {
    if (!vehicle || !availability) return;
    
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a date range');
      return;
    }
    
    const validationError = getValidationError();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (availability.availableCount === 0) {
      toast.error('No vehicles available for the selected dates');
      return;
    }

    if (quantity > availability.availableCount) {
      toast.error(`Only ${availability.availableCount} vehicles available`);
      return;
    }

    const pricing = calculatePricing(
      availability.pricePerHour,
      dateRange.from,
      dateRange.to,
      quantity
    );

    const success = addToCart({
      carTypeId: vehicle.id,
      carTypeName: vehicle.carName,
      pricePerHour: availability.pricePerHour,
      pricePerDay: availability.pricePerDay,
      quantity,
      pickupDateTime: dateRange.from,
      returnDateTime: dateRange.to,
      ...pricing,
      image: vehicle.image,
    });
    
    if (success) {
      // Optional: Reset form after adding
      setDateRange(undefined);
      setQuantity(1);
      setAvailability(null);
    }
  };

  const getPricing = () => {
    if (!availability || !dateRange?.from || !dateRange?.to) return null;
    
    return calculatePricing(
      availability.pricePerHour,
      dateRange.from,
      dateRange.to,
      quantity
    );
  };

  const getDuration = () => {
    if (!dateRange?.from || !dateRange?.to) return { text: "0 days", minutes: 0, hours: 0, days: 0 };
    
    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      const remainingHours = hours % 24;
      return { 
        text: remainingHours > 0 ? `${days} day${days > 1 ? 's' : ''} ${remainingHours} hr${remainingHours > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''}`,
        minutes, 
        hours, 
        days 
      };
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return { 
        text: remainingMinutes > 0 ? `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min` : `${hours} hr${hours > 1 ? 's' : ''}`,
        minutes, 
        hours, 
        days 
      };
    } else {
      return { 
        text: `${minutes} minute${minutes > 1 ? 's' : ''}`,
        minutes, 
        hours, 
        days 
      };
    }
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
                <img src={getServerUrl() + vehicle.image} alt={vehicle.carName} className="w-full h-full object-cover" />
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
                  <p className="text-sm text-muted-foreground">per hour</p>
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
              {/* Rental Period Picker */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Rental Period</label>
                <RentalPeriodPicker dateRange={dateRange} onDateRangeChange={setDateRange} />
              </div>

              {/* Availability Status */}
              {dateRange?.from && dateRange?.to && (
                <div className="border rounded-lg p-3">
                  {checkingAvailability ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking availability...</span>
                    </div>
                  ) : availabilityError ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{availabilityError}</span>
                    </div>
                  ) : availability ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        <span className="font-semibold text-green-600">{availability.availableCount}</span> of {availability.totalCount} vehicles available
                      </span>
                    </div>
                  ) : null}
                  
                  {getValidationError() && (
                    <div className="flex items-center gap-2 text-destructive mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{getValidationError()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Select 
                  value={quantity.toString()} 
                  onValueChange={(val) => setQuantity(parseInt(val))}
                  disabled={!availability || availability.availableCount === 0}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: availability?.availableCount || vehicle.quantity }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'vehicle' : 'vehicles'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing Summary */}
              {dateRange?.from && dateRange?.to && availability && !getValidationError() && (
                <div className="border-t pt-4 space-y-2">
                  {(() => {
                    const pricing = getPricing();
                    if (!pricing) return null;
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration</span>
                          <span>{getDuration().text}</span>
                        </div>
                        {pricing.totalDays > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Day rate ({pricing.totalDays} day{pricing.totalDays > 1 ? 's' : ''} × ${availability.pricePerDay})</span>
                            <span>${(pricing.totalDays * availability.pricePerDay * quantity).toFixed(2)}</span>
                          </div>
                        )}
                        {pricing.remainingHours > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Hourly rate ({pricing.remainingHours} hr{pricing.remainingHours > 1 ? 's' : ''} × ${availability.pricePerHour})</span>
                            <span>${(pricing.remainingHours * availability.pricePerHour * quantity).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quantity</span>
                          <span>{quantity} vehicle{quantity > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total</span>
                          <span>${pricing.totalPrice.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Add to Cart Button */}
              <Button 
                onClick={handleAddToCart} 
                className="w-full" 
                size="lg"
                disabled={
                  !dateRange?.from || 
                  !dateRange?.to || 
                  !availability || 
                  availability.availableCount === 0 || 
                  !!getValidationError() ||
                  checkingAvailability
                }
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Minimum rental period: {MINIMUM_RENTAL_HOURS} hours
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
