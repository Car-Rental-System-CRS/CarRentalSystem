export type VehicleStatus = 'Available' | 'Rented' | 'Maintenance';

export interface Vehicle {
  id: number;
  name: string;
  status: VehicleStatus;
  price: string;
  type: string;
  location: string;
  addedDate: string;
  renter?: string;
}

export const vehicles: Vehicle[] = [
  {
    id: 1,
    name: 'Toyota Vios 2023',
    status: 'Available',
    price: '$45/day',
    type: 'Sedan',
    location: 'Hanoi',
    addedDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Honda City 2024',
    status: 'Rented',
    price: '$50/day',
    type: 'Sedan',
    location: 'Ho Chi Minh',
    addedDate: '2024-02-10',
    renter: 'John Doe',
  },
  {
    id: 3,
    name: 'Ford Ranger 2023',
    status: 'Maintenance',
    price: '$90/day',
    type: 'Pickup',
    location: 'Da Nang',
    addedDate: '2024-01-20',
  },
  {
    id: 4,
    name: 'Hyundai Accent 2023',
    status: 'Available',
    price: '$40/day',
    type: 'Sedan',
    location: 'Hanoi',
    addedDate: '2024-03-05',
  },
  {
    id: 5,
    name: 'Mazda CX-5 2024',
    status: 'Available',
    price: '$75/day',
    type: 'SUV',
    location: 'Ho Chi Minh',
    addedDate: '2024-02-28',
  },
  {
    id: 6,
    name: 'Toyota Innova 2023',
    status: 'Rented',
    price: '$65/day',
    type: 'MPV',
    location: 'Hai Phong',
    addedDate: '2024-01-30',
    renter: 'Jane Smith',
  },
  {
    id: 7,
    name: 'Kia Seltos 2024',
    status: 'Available',
    price: '$55/day',
    type: 'SUV',
    location: 'Can Tho',
    addedDate: '2024-03-12',
  },
  {
    id: 8,
    name: 'VinFast VF 8 2024',
    status: 'Maintenance',
    price: '$85/day',
    type: 'Electric',
    location: 'Hanoi',
    addedDate: '2024-02-15',
  },
  {
    id: 9,
    name: 'Mercedes C300 2023',
    status: 'Rented',
    price: '$120/day',
    type: 'Luxury',
    location: 'Ho Chi Minh',
    addedDate: '2024-01-25',
    renter: 'Robert Johnson',
  },
  {
    id: 10,
    name: 'BMW X3 2023',
    status: 'Available',
    price: '$110/day',
    type: 'SUV',
    location: 'Da Nang',
    addedDate: '2024-03-08',
  },
  {
    id: 11,
    name: 'Hyundai Santa Fe 2024',
    status: 'Available',
    price: '$80/day',
    type: 'SUV',
    location: 'Nha Trang',
    addedDate: '2024-02-20',
  },
  {
    id: 12,
    name: 'Mitsubishi Xpander 2023',
    status: 'Rented',
    price: '$60/day',
    type: 'MPV',
    location: 'Vung Tau',
    addedDate: '2024-03-01',
    renter: 'Sarah Wilson',
  },
  {
    id: 13,
    name: 'Toyota Fortuner 2024',
    status: 'Available',
    price: '$95/day',
    type: 'SUV',
    location: 'Hanoi',
    addedDate: '2024-01-18',
  },
  {
    id: 14,
    name: 'Honda CR-V 2023',
    status: 'Maintenance',
    price: '$70/day',
    type: 'SUV',
    location: 'Ho Chi Minh',
    addedDate: '2024-02-05',
  },
  {
    id: 15,
    name: 'Ford Everest 2024',
    status: 'Available',
    price: '$85/day',
    type: 'SUV',
    location: 'Da Nang',
    addedDate: '2024-03-15',
  },
];
