// components/VehicleTable.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Car,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  Wrench,
  Calendar,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { vehicles } from '@/data/vehicles';

const ITEMS_PER_PAGE = 10;

export default function VehicleTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Calculate total pages
  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE);

  // Filter vehicles based on search and filter
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get current page items
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setSelectedVehicle(null);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Available':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          variant: 'default' as const,
        };
      case 'Rented':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Eye,
          variant: 'secondary' as const,
        };
      case 'Maintenance':
        return {
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: Wrench,
          variant: 'outline' as const,
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: XCircle,
          variant: 'outline' as const,
        };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUV':
        return 'text-blue-600 bg-blue-50';
      case 'Sedan':
        return 'text-purple-600 bg-purple-50';
      case 'Electric':
        return 'text-green-600 bg-green-50';
      case 'Luxury':
        return 'text-amber-600 bg-amber-50';
      case 'MPV':
        return 'text-indigo-600 bg-indigo-50';
      case 'Pickup':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const statusCounts = {
    all: vehicles.length,
    Available: vehicles.filter((v) => v.status === 'Available').length,
    Rented: vehicles.filter((v) => v.status === 'Rented').length,
    Maintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header Section */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicles Table</h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add New Vehicle
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Total Vehicles
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {vehicles.length}
                </p>
              </div>
              <Car className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Available</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statusCounts.Available}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Rented</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statusCounts.Rented}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">
                  Maintenance
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {statusCounts.Maintenance}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search vehicles or locations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="bg-transparent outline-none text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicle
                </div>
              </th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Daily Rate
              </th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Added Date
              </th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {currentVehicles.map((v) => {
              const statusConfig = getStatusConfig(v.status);
              const StatusIcon = statusConfig.icon;

              return (
                <tr
                  key={v.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {v.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={`text-xs font-normal ${getTypeColor(v.type)}`}
                          >
                            {v.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            ID: {v.id.toString().padStart(3, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {v.location}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <Badge
                      variant={statusConfig.variant}
                      className="flex items-center gap-1.5"
                    >
                      <StatusIcon className="w-3 h-3" />
                      {v.status}
                    </Badge>
                    {v.renter && (
                      <div className="text-xs text-gray-500 mt-1">
                        Rented by: {v.renter}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-900">{v.price}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {v.addedDate}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setSelectedVehicle(
                              selectedVehicle === v.id ? null : v.id
                            )
                          }
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        {selectedVehicle === v.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10 py-1">
                            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            <button className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Vehicle
                            </button>
                            <div className="border-t my-1"></div>
                            <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Vehicle
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination */}
      <div className="border-t bg-gray-50 px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold">
              {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)}
            </span>{' '}
            of <span className="font-semibold">{filteredVehicles.length}</span>{' '}
            vehicles
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                • Found {filteredVehicles.length} results for "{searchQuery}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="min-w-10 h-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {totalPages > 5 && (
                <>
                  {currentPage < totalPages - 2 && totalPages > 6 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  {currentPage < totalPages - 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      className="min-w-10 h-9"
                    >
                      {totalPages}
                    </Button>
                  )}
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
