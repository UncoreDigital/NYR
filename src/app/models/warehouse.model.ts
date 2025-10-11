export interface WarehouseResponse {
  id: number;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
}

export interface Warehouse {
  id: number;
  warehouseName: string;
  warehouseAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateWarehouseRequest {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface UpdateWarehouseRequest {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
}
