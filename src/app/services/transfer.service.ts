import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment';
import { PaginationParams, PagedResult } from '../models/pagination.model';

export interface TransferResponse {
  id: number;
  type: string; // "VanTransfer" or "RestockRequest"
  locationId?: number;
  locationName: string;
  customerId: number;
  customerName: string;
  deliveryDate?: string;
  requestDate: string;
  driverName?: string;
  driverId?: number;
  status: string;
  totalItems: number;
  createdAt: string;
  shippingInventory?: any[];
  locationAddress?: string;
  locationInventory?: any[];
}

export interface TransferSummaryResponse {
  totalVanTransfers: number;
  totalRestockRequests: number;
  totalTransfers: number;
  pendingTransfers: number;
  completedTransfers: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllTransfers(): Observable<TransferResponse[]> {
    return this.http.get<TransferResponse[]>(`${this.API_URL}/Transfers`);
  }

  getAllTransfersPaged(params: PaginationParams): Observable<PagedResult<TransferResponse>> {
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

    return this.http.get<PagedResult<TransferResponse>>(`${this.API_URL}/Transfers`, { params: httpParams });
  }

  getTransferById(id: number, type: string): Observable<TransferResponse> {
    return this.http.get<TransferResponse>(`${this.API_URL}/Transfers/${id}?type=${type}`);
  }

  getTransfersByLocation(locationId: number): Observable<TransferResponse[]> {
    return this.http.get<TransferResponse[]>(`${this.API_URL}/Transfers/location/${locationId}`);
  }

  getTransfersByCustomer(customerId: number): Observable<TransferResponse[]> {
    return this.http.get<TransferResponse[]>(`${this.API_URL}/Transfers/customer/${customerId}`);
  }

  getTransfersByStatus(status: string): Observable<TransferResponse[]> {
    return this.http.get<TransferResponse[]>(`${this.API_URL}/Transfers/status/${status}`);
  }

  getTransfersByType(type: string): Observable<TransferResponse[]> {
    return this.http.get<TransferResponse[]>(`${this.API_URL}/Transfers/type/${type}`);
  }

  getTransfersByTypePaged(type: string, params: PaginationParams): Observable<PagedResult<TransferResponse>> {
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

    return this.http.get<PagedResult<TransferResponse>>(`${this.API_URL}/Transfers/type/${type}`, { params: httpParams });
  }

  getTransfersSummary(): Observable<TransferSummaryResponse> {
    return this.http.get<TransferSummaryResponse>(`${this.API_URL}/Transfers/summary`);
  }

  getInventoryCountsbyDriverId(driverId: number): Observable<any> {
    return this.http.get<TransferSummaryResponse>(`${this.API_URL}/Transfers/inventory-counts/driver/${driverId}`);
  }
}
