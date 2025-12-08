import { DriverAvailability } from './driver-availability.model';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  roleId: number;
  roleName: string;
  customerId: number | null;
  customerName: string | null;
  locationId: number | null;
  locationName: string | null;
  createdAt: string;
  isActive: boolean;
  driverAvailabilities?: DriverAvailability[];
  warehouseId?: number | null;
  warehouseName?: string | '';
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleName?: string; // Optional for backward compatibility
  roleId?: number;
  customerId: number | null;
  customerName: string | null;
  locationId: number | null;
  locationName: string | null;
  createdAt?: string;
  isActive?: boolean;
  warehouseId?: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  password: string;
  roleId: number;
  customerId: number | null;
  locationId: number | null;
  warehouseId: number | null;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  roleId: number;
  customerId: number | null;
  locationId: number | null;
  isActive: boolean;
  warehouseId: number | null;
}