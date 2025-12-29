export interface VanResponse {
  id: number;
  defaultDriverName: string;
  vanName: string;
  vanNumber: string;
  isActive: boolean;
  driverId?: number;
}

export interface Van {
  id: number;
  vanName: string;
  vanNumber: string;
  defaultDriverName: string;
  isActive: boolean;
}

export interface CreateVanRequest {
  defaultDriverName: string;
  vanName: string;
  vanNumber: string;
  driverId?: number;
}

export interface UpdateVanRequest {
  defaultDriverName: string;
  vanName: string;
  vanNumber: string;
  isActive: boolean;
  driverId?: number;
}
