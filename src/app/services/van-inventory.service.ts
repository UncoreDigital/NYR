import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  VanWithInventorySummaryResponse, 
  VanInventoryResponse, 
  VanInventoryItemResponse,
  CreateVanInventoryRequest 
} from '../models/van-inventory.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class VanInventoryService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVansWithTransfers(): Observable<VanWithInventorySummaryResponse[]> {
    return this.http.get<VanWithInventorySummaryResponse[]>(`${this.API_URL}/VanInventory/vans`);
  }

  getAllTransfers(): Observable<VanInventoryResponse[]> {
    return this.http.get<VanInventoryResponse[]>(`${this.API_URL}/VanInventory`);
  }

  getTransferById(id: number): Observable<VanInventoryResponse> {
    return this.http.get<VanInventoryResponse>(`${this.API_URL}/VanInventory/${id}`);
  }

  getTransferItemsByVanId(vanId: number): Observable<VanInventoryItemResponse[]> {
    return this.http.get<VanInventoryItemResponse[]>(`${this.API_URL}/VanInventory/van/${vanId}/items`);
  }

  createTransfer(payload: CreateVanInventoryRequest): Observable<VanInventoryResponse> {
    return this.http.post<VanInventoryResponse>(`${this.API_URL}/VanInventory`, payload);
  }

  deleteTransfer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/VanInventory/${id}`);
  }
}
