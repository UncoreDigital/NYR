import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCustomerRequest, CustomerResponse } from '../models/customer.model';
import { environment } from 'environment';

export interface CustomerApiModel {
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

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<CustomerApiModel[]> {
    return this.http.get<CustomerApiModel[]>(`${this.API_URL}/Customers`);
  }

  getCustomerById(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.API_URL}/Customers/${id}`);
  }

  createCustomer(payload: CreateCustomerRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.API_URL}/Customers`, payload);
  }

  updateCustomer(id: number, payload: CustomerResponse): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.API_URL}/Customers/${id}`, payload);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Customers/${id}`);
  }
}
