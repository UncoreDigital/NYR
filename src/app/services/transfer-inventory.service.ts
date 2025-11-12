import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  TransferInventoryLocationResponse, 
  TransferInventoryResponse, 
  TransferInventoryItemResponse,
  CreateTransferInventoryRequest 
} from '../models/transfer-inventory.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class TransferInventoryService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLocationsWithTransfers(): Observable<TransferInventoryLocationResponse[]> {
    return this.http.get<TransferInventoryLocationResponse[]>(`${this.API_URL}/TransferInventory/locations`);
  }

  getAllTransfers(): Observable<TransferInventoryResponse[]> {
    return this.http.get<TransferInventoryResponse[]>(`${this.API_URL}/TransferInventory`);
  }

  getTransferById(id: number): Observable<TransferInventoryResponse> {
    return this.http.get<TransferInventoryResponse>(`${this.API_URL}/TransferInventory/${id}`);
  }

  getTransferItemsByLocationId(locationId: number): Observable<TransferInventoryItemResponse[]> {
    return this.http.get<TransferInventoryItemResponse[]>(`${this.API_URL}/TransferInventory/location/${locationId}/items`);
  }

  createTransfer(payload: CreateTransferInventoryRequest): Observable<TransferInventoryResponse> {
    return this.http.post<TransferInventoryResponse>(`${this.API_URL}/TransferInventory`, payload);
  }

  deleteTransfer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/TransferInventory/${id}`);
  }
}
