import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCustomerRequest, CustomerResponse } from '../models/customer.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
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

  getCustomersPaged(params: PaginationParams): Observable<PagedResult<CustomerApiModel>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PagedResult<CustomerApiModel>>(`${this.API_URL}/Customers`, { params: httpParams });
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
