export interface SupplierApiModel {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  contactPerson: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreateSupplierRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  contactPerson: string;
}

export interface UpdateSupplierRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  contactPerson: string;
  isActive: boolean;
}
