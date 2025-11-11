import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment';

// Interface for supplies request data
export interface SuppliesRequest {
  email: string;
  emailTemplate: string;
  supplierId: number;
  supplierName: string;
  requestedProducts: RequestedProductVariation[];
}

export interface RequestedProductVariation {
  productId: number;
  productName: string;
  variationType: string;
  variationValue: string;
  quantity: number;
}

export interface SuppliesResponse {
  id: number;
  email: string;
  supplierId: number;
  supplierName: string;
  status: string;
  totalItems: number;
  requestedProducts: RequestedProductVariation[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuppliesService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Create a new supplies request
  createSuppliesRequest(payload: SuppliesRequest): Observable<SuppliesResponse> {
    return this.http.post<SuppliesResponse>(`${this.API_URL}/RequestSupplies`, payload);
  }

  // Get all supplies requests
  getSuppliesRequests(): Observable<SuppliesResponse[]> {
    return this.http.get<SuppliesResponse[]>(`${this.API_URL}/supplies-requests`);
  }

  // Get supplies request by ID
  getSuppliesRequestById(id: number): Observable<SuppliesResponse> {
    return this.http.get<SuppliesResponse>(`${this.API_URL}/supplies-requests/${id}`);
  }

  // Update supplies request
  updateSuppliesRequest(id: number, payload: Partial<SuppliesRequest>): Observable<SuppliesResponse> {
    return this.http.put<SuppliesResponse>(`${this.API_URL}/supplies-requests/${id}`, payload);
  }

  // Delete supplies request
  deleteSuppliesRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/supplies-requests/${id}`);
  }

  // Update request status
  updateRequestStatus(id: number, status: string): Observable<SuppliesResponse> {
    return this.http.patch<SuppliesResponse>(`${this.API_URL}/supplies-requests/${id}/status`, { status });
  }
}