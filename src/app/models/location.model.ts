export interface LocationResponse {
  id: number;
  customerId: number;
  customerName: string;
  locationName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  title: string;
  locationPhone: string;
  mobilePhone: string;
  faxNumber: string;
  email: string;
  comments: string;
  createdAt: string;
  isActive: boolean;
  userId?: number;
  userName?: string;
}

export interface CreateLocationRequest {
  customerId: number;
  locationName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  title: string;
  locationPhone: string;
  mobilePhone: string;
  faxNumber: string;
  email: string;
  comments: string;
  userId?: number;
}
