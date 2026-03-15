import axiosInstance from '@/lib/axios';

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface MediaFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  displayOrder?: number;
  createdAt: string;
  modifiedAt: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
}

export interface CarAvailabilityResponse {
  carTypeId: string;
  carTypeName: string;
  totalCount: number;
  availableCount: number;
  pricePerHour: number;
  pricePerDay: number;
  pickupDateTime: string;
  returnDateTime: string;
}

export interface CarType {
  id: string;
  name: string;
  numberOfSeats: number;
  consumptionKwhPerKm: number;
  price: number;
  description?: string;
  carQuantity: number;
  carBrand: Brand;
  mediaFiles: MediaFile[];
  features: Feature[];
}

export interface Car {
  id: string;
  licensePlate: string;
  importDate: string;
  typeId: string;
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  pricePerDay?: number;
  quantity?: number;
  imageUrl?: string;
  damageImages?: MediaFile[];
}

// Car Type API
export const carTypeApi = {
  getAll: async (params?: {
    name?: string;
    numberOfSeats?: number;
    consumptionKwhPerKm?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
  }) => {
    const response = await axiosInstance.get<APIResponse<PageResponse<CarType>>>('/api/car-types', {
      params: {
        ...params,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<APIResponse<CarType>>(`/api/car-types/${id}`);
    return response.data;
  },

  checkAvailability: async (
    carTypeId: string,
    pickupDateTime: Date,
    returnDateTime: Date
  ): Promise<CarAvailabilityResponse> => {
    const response = await axiosInstance.get<APIResponse<CarAvailabilityResponse>>(
      `/api/car-types/${carTypeId}/availability`,
      {
        params: {
          pickupDateTime: pickupDateTime.toISOString(),
          returnDateTime: returnDateTime.toISOString(),
        },
      }
    );
    return response.data.data;
  },

  getAvailableCars: async (
    carTypeId: string,
    pickupDateTime: Date,
    returnDateTime: Date
  ): Promise<Car[]> => {
    const response = await axiosInstance.get<APIResponse<Car[]>>(
      `/api/car-types/${carTypeId}/available-cars`,
      {
        params: {
          pickupDateTime: pickupDateTime.toISOString(),
          returnDateTime: returnDateTime.toISOString(),
        },
      }
    );
    return response.data.data;
  },
};

// Car Brand API
export const carBrandApi = {
  getAll: async (params?: { name?: string; page?: number; size?: number }) => {
    const response = await axiosInstance.get<APIResponse<PageResponse<Brand>>>('/api/car-brands', {
      params: {
        ...params,
        page: params?.page ?? 0,
        size: params?.size ?? 100,
      },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<APIResponse<Brand>>(`/api/car-brands/${id}`);
    return response.data;
  },
};

// Car Feature API
export const carFeatureApi = {
  getAll: async (params?: { name?: string; description?: string; page?: number; size?: number }) => {
    const response = await axiosInstance.get<APIResponse<PageResponse<Feature>>>('/api/car-features', {
      params: {
        ...params,
        page: params?.page ?? 0,
        size: params?.size ?? 100,
      },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<APIResponse<Feature>>(`/api/car-features/${id}`);
    return response.data;
  },
};

// Model Feature API
export const modelFeatureApi = {
  getFeaturesByType: async (typeId: string, params?: { page?: number; size?: number }) => {
    const response = await axiosInstance.get<APIResponse<PageResponse<Feature>>>(
      `/api/model-features/by-type/${typeId}`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 100,
        },
      }
    );
    return response.data;
  },

  getTypesByFeature: async (featureId: string, params?: { page?: number; size?: number }) => {
    const response = await axiosInstance.get<APIResponse<PageResponse<CarType>>>(
      `/api/model-features/by-feature/${featureId}`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 100,
        },
      }
    );
    return response.data;
  },
};

// Car API (individual units)
export const carApi = {
  getAll: async (params?: {
    licensePlate?: string;
    importFrom?: string;
    importTo?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await axiosInstance.get<APIResponse<PageResponse<Car>>>('/api/cars', {
      params: {
        ...params,
        page: params?.page ?? 0,
        size: params?.size ?? 100,
      },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<APIResponse<Car>>(`/api/cars/${id}`);
    return response.data;
  },

  getByTypeId: async (typeId: string) => {
    // This would need to be implemented on backend or we fetch all and filter
    const response = await axiosInstance.get<APIResponse<PageResponse<Car>>>('/api/cars', {
      params: {
        page: 0,
        size: 1000,
      },
    });
    // Filter by typeId on frontend for now
    const filteredCars = response.data.data.items.filter((car: Car) => car.typeId === typeId);
    return {
      ...response.data,
      data: {
        ...response.data.data,
        items: filteredCars,
        totalItems: filteredCars.length,
      },
    };
  },
};
