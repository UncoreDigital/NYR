import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment';

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
  status: string;
  totalItems: number;
  createdAt: string;
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

  getTransfersSummary(): Observable<TransferSummaryResponse> {
    return this.http.get<TransferSummaryResponse>(`${this.API_URL}/Transfers/summary`);
  }
}
