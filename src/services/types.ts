export type Brand = 'Shell' | 'Ipiranga' | 'Petrobras' | 'Atem' | 'Branded';

export type FuelType = 'comum' | 'aditivada' | 'etanol' | 'diesel' | 'gnv';

export interface FuelPrices {
  comum: number;
  aditivada: number;
  etanol: number;
  diesel: number;
  gnv: number | null;
}

export interface StationServices {
  conveniencia: boolean;
  calibragem: boolean;
  lavagem: boolean;
  gnv: boolean;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Station {
  id: string;
  name: string;
  brand: Brand;
  neighborhood: string;
  address: string;
  coordinate: Coordinate;
  prices: FuelPrices;
  services: StationServices;
  photo: string;
  updatedAt: string;
}

export interface StationWithDistance extends Station {
  distanceKm: number;
}

export type SortMode = 'price' | 'distance';

export interface Filters {
  brands: Brand[];
  fuel: FuelType;
  services: (keyof StationServices)[];
}

export interface PriceReport {
  id: string;
  stationId: string;
  stationName: string;
  fuel: FuelType;
  price: number;
  photoUri: string | null;
  reportedAt: string;
}
