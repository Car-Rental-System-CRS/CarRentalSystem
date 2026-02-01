export interface Feature {
  id: number;
  name: string;
  description?: string;
}

export const features: Feature[] = [
  { id: 1, name: 'Air Conditioning' },
  { id: 2, name: 'GPS Navigation' },
  { id: 3, name: 'Bluetooth' },
  { id: 4, name: 'Rear Camera' },
  { id: 5, name: 'Cruise Control' },
];
