export interface VehicleUnit {
  carId: number;
  license: string;
  importDate: string;
}

export interface VehicleModel {
  id: number;
  carName: string;
  brandId: number;
  numberOfSeats: number;
  consumption: string;
  pricePerDay: number;
  featureIds: number[];
  units: VehicleUnit[];

  // derived field
  quantity: number;
}

/* ---------------- RAW DATA (NO QUANTITY) ---------------- */

const rawVehicleModels = [
  {
    id: 1,
    carName: 'Toyota Vios 2024',
    brandId: 1,
    numberOfSeats: 5,
    consumption: '5.8L/100km',
    pricePerDay: 45,
    featureIds: [1, 3, 4],
    units: [
      { license: '30A-123.45', importDate: '2024-01-12' },
      { license: '30A-456.78', importDate: '2024-02-02' },
      { license: '30A-789.00', importDate: '2024-03-10' },
    ],
  },
  {
    id: 2,
    carName: 'Ford Everest 2024',
    brandId: 2,
    numberOfSeats: 7,
    consumption: '8.5L/100km',
    pricePerDay: 85,
    featureIds: [2, 5],
    units: [
      { license: '43A-222.11', importDate: '2024-02-15' },
      { license: '43A-333.22', importDate: '2024-03-01' },
    ],
  },
  {
    id: 3,
    carName: 'Honda City 2023',
    brandId: 3,
    numberOfSeats: 5,
    consumption: '5.5L/100km',
    pricePerDay: 42,
    featureIds: [1, 3],
    units: [{ license: '29A-111.22', importDate: '2024-01-20' }],
  },
  {
    id: 4,
    carName: 'BMW X5 2024',
    brandId: 4,
    numberOfSeats: 7,
    consumption: '9.5L/100km',
    pricePerDay: 150,
    featureIds: [1, 2, 5],
    units: [{ license: '88A-999.88', importDate: '2024-02-01' }],
  },
  {
    id: 5,
    carName: 'Mercedes C200',
    brandId: 5,
    numberOfSeats: 5,
    consumption: '7.0L/100km',
    pricePerDay: 120,
    featureIds: [1, 3, 5],
    units: [{ license: '51A-555.66', importDate: '2024-03-02' }],
  },
  {
    id: 6,
    carName: 'Toyota Fortuner',
    brandId: 1,
    numberOfSeats: 7,
    consumption: '8.8L/100km',
    pricePerDay: 95,
    featureIds: [2, 5],
    units: [{ license: '30F-222.33', importDate: '2024-02-11' }],
  },
  {
    id: 7,
    carName: 'Ford Ranger Wildtrak',
    brandId: 2,
    numberOfSeats: 5,
    consumption: '9.0L/100km',
    pricePerDay: 90,
    featureIds: [2, 5],
    units: [{ license: '43C-777.55', importDate: '2024-01-25' }],
  },
  {
    id: 8,
    carName: 'Honda CR-V 2024',
    brandId: 3,
    numberOfSeats: 7,
    consumption: '7.5L/100km',
    pricePerDay: 88,
    featureIds: [1, 2, 4],
    units: [{ license: '29C-888.11', importDate: '2024-03-05' }],
  },
  {
    id: 9,
    carName: 'BMW 320i',
    brandId: 4,
    numberOfSeats: 5,
    consumption: '6.9L/100km',
    pricePerDay: 110,
    featureIds: [1, 3],
    units: [{ license: '88B-321.99', importDate: '2024-02-22' }],
  },
  {
    id: 10,
    carName: 'Mercedes GLC 300',
    brandId: 5,
    numberOfSeats: 5,
    consumption: '8.0L/100km',
    pricePerDay: 140,
    featureIds: [1, 2, 5],
    units: [{ license: '51G-777.12', importDate: '2024-01-30' }],
  },

  // -------- PAGE 2 --------

  {
    id: 11,
    carName: 'Toyota Corolla Cross',
    brandId: 1,
    numberOfSeats: 5,
    consumption: '6.5L/100km',
    pricePerDay: 70,
    featureIds: [1, 2],
    units: [{ license: '30X-111.99', importDate: '2024-03-10' }],
  },
  {
    id: 12,
    carName: 'Ford Explorer',
    brandId: 2,
    numberOfSeats: 7,
    consumption: '10.2L/100km',
    pricePerDay: 130,
    featureIds: [2, 5],
    units: [{ license: '43E-888.44', importDate: '2024-02-14' }],
  },
  {
    id: 13,
    carName: 'Honda Civic RS',
    brandId: 3,
    numberOfSeats: 5,
    consumption: '6.0L/100km',
    pricePerDay: 65,
    featureIds: [1, 3, 4],
    units: [{ license: '29C-333.22', importDate: '2024-01-19' }],
  },
  {
    id: 14,
    carName: 'BMW X3',
    brandId: 4,
    numberOfSeats: 5,
    consumption: '8.3L/100km',
    pricePerDay: 135,
    featureIds: [1, 2],
    units: [{ license: '88X-999.77', importDate: '2024-02-28' }],
  },
  {
    id: 15,
    carName: 'Mercedes E300',
    brandId: 5,
    numberOfSeats: 5,
    consumption: '7.8L/100km',
    pricePerDay: 160,
    featureIds: [1, 3, 5],
    units: [{ license: '51E-555.88', importDate: '2024-03-01' }],
  },
  {
    id: 16,
    carName: 'Toyota Camry Hybrid',
    brandId: 1,
    numberOfSeats: 5,
    consumption: '4.5L/100km',
    pricePerDay: 90,
    featureIds: [1, 2, 3],
    units: [{ license: '30H-444.33', importDate: '2024-02-05' }],
  },
  {
    id: 17,
    carName: 'Ford Territory',
    brandId: 2,
    numberOfSeats: 5,
    consumption: '7.9L/100km',
    pricePerDay: 75,
    featureIds: [1, 4],
    units: [{ license: '43T-222.66', importDate: '2024-01-22' }],
  },
  {
    id: 18,
    carName: 'Honda HR-V',
    brandId: 3,
    numberOfSeats: 5,
    consumption: '6.2L/100km',
    pricePerDay: 60,
    featureIds: [1, 3],
    units: [{ license: '29H-999.55', importDate: '2024-02-12' }],
  },
  {
    id: 19,
    carName: 'BMW i4 Electric',
    brandId: 4,
    numberOfSeats: 5,
    consumption: '0 kWh (EV)',
    pricePerDay: 170,
    featureIds: [1, 2, 3, 5],
    units: [{ license: '88E-000.01', importDate: '2024-03-12' }],
  },
  {
    id: 20,
    carName: 'Mercedes EQB',
    brandId: 5,
    numberOfSeats: 7,
    consumption: '0 kWh (EV)',
    pricePerDay: 180,
    featureIds: [1, 2, 4, 5],
    units: [{ license: '51E-888.00', importDate: '2024-03-15' }],
  },
];

/* ---------------- FINAL EXPORTED DATA ---------------- */

export const vehicleModels: VehicleModel[] = rawVehicleModels.map((v) => ({
  ...v,
  units: v.units.map((u, index) => ({
    ...u,
    carId: v.id * 1000 + index + 1, // unique & stable
  })),
  quantity: v.units.length,
}));
