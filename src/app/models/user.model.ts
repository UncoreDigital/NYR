export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  roleName: string;
  customerId: number | null;
  customerName: string | null;
  locationId: number | null;
  locationName: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
