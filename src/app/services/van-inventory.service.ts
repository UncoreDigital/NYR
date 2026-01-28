import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  VanWithInventorySummaryResponse, 
  VanInventoryResponse, 
  VanInventoryItemResponse,
  CreateVanInventoryRequest,
  TransferTrackingResponse,
  UpdateTransferStatusRequest
} from '../models/van-inventory.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
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

  getVansWithTransfersPaged(params: PaginationParams): Observable<PagedResult<VanWithInventorySummaryResponse>> {
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

    return this.http.get<PagedResult<VanWithInventorySummaryResponse>>(`${this.API_URL}/VanInventory/vans`, { params: httpParams });
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

  getAllTransfersTracking(): Observable<TransferTrackingResponse[]> {
    return this.http.get<TransferTrackingResponse[]>(`${this.API_URL}/VanInventory/tracking`);
  }

  updateTransferStatus(id: number, payload: UpdateTransferStatusRequest): Observable<TransferTrackingResponse> {
    return this.http.patch<TransferTrackingResponse>(`${this.API_URL}/VanInventory/${id}/status`, payload);
  }
}
