export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  roleName: string;
  customerId: number;
  customerName: string;
  locationId: number;
  locationName: string;
  createdAt: string;
  isActive: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleName?: string; // Optional for backward compatibility
  roleId?: number;
  customerId?: number;
  locationId?: number;
  isActive?: boolean;
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
  password: string;
  roleId: number;
  customerId: number;
  locationId: number;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  customerId: number;
  locationId: number;
  isActive: boolean;
}