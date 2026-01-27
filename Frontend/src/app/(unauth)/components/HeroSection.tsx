// components/heroSection.tsx
'use client';

import { Car, MapPin, Calendar, Clock} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-white to-white text-gray-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/3 opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-100 rounded-full translate-y-1/2 -translate-x-1/4 opacity-30"></div>

      <div className="container mx-auto px-4 pt-20 pb-28 md:pt-28 md:pb-36 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header with badges */}
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Mioto — With You On
              <span className="block text-blue-600 mt-3 pb-4 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Every Journey
              </span>
            </h1>

            <p className="text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Experience the difference with over 10,000 modern family cars
              across Vietnam
            </p>
          </div>

          {/* Booking Form with Tabs */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-6 max-w-5xl mx-auto">
            <Tabs defaultValue="self-drive" className="w-full">
              {/* Enhanced Tabs with better hover */}
              <TabsList className="grid w-full grid-cols-2 mb-16 bg-white p-2 rounded-2xl gap-2">
                <TabsTrigger
                  value="self-drive"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-5 px-8 text-lg font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group"
                >
                  <Car className="w-6 h-6 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="whitespace-nowrap">Self-drive</span>
                </TabsTrigger>
                <TabsTrigger
                  value="long-term"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-5 px-8 text-lg font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group"
                >
                  <Calendar className="w-6 h-6 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="whitespace-nowrap">Long-term rental</span>
                </TabsTrigger>
              </TabsList>

              {/* Self-drive Tab */}
              <TabsContent
                value="self-drive"
                className="mt-0 animate-in fade-in duration-300"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Location Selection */}
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                      Location
                    </label>
                    <div className="border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            Ho Chi Minh City
                          </div>
                          <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-700">
                            Choose pickup location
                          </div>
                        </div>
                        <MapPin className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                      Rental time
                    </label>
                    <div className="border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            21:00
                          </div>
                          <div className="text-lg font-semibold text-gray-700">
                            25/01/2026
                          </div>
                        </div>
                        <div className="px-4">
                          <div className="w-12 h-1 bg-gray-300 group-hover:bg-blue-400 transition-colors"></div>
                        </div>
                        <div className="text-center flex-1">
                          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            20:00
                          </div>
                          <div className="text-lg font-semibold text-gray-700">
                            26/01/2026
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* With driver Tab */}
              <TabsContent
                value="with-driver"
                className="mt-0 animate-in fade-in duration-300"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                      Pickup location
                    </label>
                    <div className="border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            Enter address
                          </div>
                          <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-700">
                            Customer pickup point
                          </div>
                        </div>
                        <MapPin className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-blue-500" />
                      Time
                    </label>
                    <div className="border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            Select date & time
                          </div>
                          <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-700">
                            Service usage time
                          </div>
                        </div>
                        <Clock className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Long-term rental Tab */}
              <TabsContent
                value="long-term"
                className="mt-0 animate-in fade-in duration-300"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                      Rental area
                    </label>
                    <div className="border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            Ho Chi Minh City
                          </div>
                          <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-700">
                            Long-term usage location
                          </div>
                        </div>
                        <MapPin className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-gray-800 flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                      Rental duration
                    </label>
                    <div className="border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            From 1 day
                          </div>
                          <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-700">
                            Minimum period
                          </div>
                        </div>
                        <div className="px-4">
                          <div className="w-12 h-1 bg-gray-300 group-hover:bg-blue-400 transition-colors"></div>
                        </div>
                        <div className="text-center flex-1">
                          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                            Up to 7 days
                          </div>
                          <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-700">
                            Maximum period
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Enhanced Search Button */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-7 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <Car className="w-6 h-6 mr-4 animate-pulse" />
                Find a Car Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
