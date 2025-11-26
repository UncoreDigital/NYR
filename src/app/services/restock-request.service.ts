import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment';

export interface RestockRequestResponse {
  id: number;
  customerId: number;
  customerName: string;
  locationId: number;
  locationName: string;
  status: string;
  requestDate: string;
  createdAt: string;
  isActive: boolean;
  items: RestockRequestItemResponse[];
}

export interface RestockRequestItemResponse {
  id: number;
  productId: number;
  productName: string;
  skuCode?: string;
  productVariationId?: number;
  variationType?: string;
  variationValue?: string;
  quantity: number;
}

export interface CreateRestockRequestRequest {
  customerId: number;
  locationId: number;
  items: CreateRestockRequestItemRequest[];
}

export interface CreateRestockRequestItemRequest {
  productId: number;
  productVariationId?: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestockRequestService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllRequests(): Observable<RestockRequestResponse[]> {
    return this.http.get<RestockRequestResponse[]>(`${this.API_URL}/RestockRequest`);
  }

  getRequestById(id: number): Observable<RestockRequestResponse> {
    return this.http.get<RestockRequestResponse>(`${this.API_URL}/RestockRequest/${id}`);
  }

  getRequestsByLocation(locationId: number): Observable<RestockRequestResponse[]> {
    return this.http.get<RestockRequestResponse[]>(`${this.API_URL}/RestockRequest/location/${locationId}`);
  }

  getRequestsByCustomer(customerId: number): Observable<RestockRequestResponse[]> {
    return this.http.get<RestockRequestResponse[]>(`${this.API_URL}/RestockRequest/customer/${customerId}`);
  }

  createRequest(payload: CreateRestockRequestRequest): Observable<RestockRequestResponse> {
    return this.http.post<RestockRequestResponse>(`${this.API_URL}/RestockRequest`, payload);
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/RestockRequest/${id}`);
  }
}
