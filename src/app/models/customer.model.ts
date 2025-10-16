export interface CreateCustomerRequest {
  companyName: string;
  dba: string;
  accountNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  contactName: string;
  jobTitle: string;
  businessPhone: string;
  mobilePhone: string;
  faxNumber: string;
  email: string;
  website: string;
}

export interface CustomerResponse {
  id: number;
  companyName: string;
  dba: string;
  accountNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  contactName: string;
  jobTitle: string;
  businessPhone: string;
  mobilePhone: string;
  faxNumber: string;
  email: string;
  website: string;
  createdAt: string;
  isActive: boolean;
}
