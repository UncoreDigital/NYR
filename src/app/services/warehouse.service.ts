import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WarehouseResponse, CreateWarehouseRequest, UpdateWarehouseRequest } from '../models/warehouse.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getWarehouses(): Observable<WarehouseResponse[]> {
    return this.http.get<WarehouseResponse[]>(`${this.API_URL}/Warehouses`);
  }

  getWarehousesPaged(params: PaginationParams): Observable<PagedResult<WarehouseResponse>> {
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

    return this.http.get<PagedResult<WarehouseResponse>>(`${this.API_URL}/Warehouses`, { params: httpParams });
  }

  getWarehouseById(id: number): Observable<WarehouseResponse> {
    return this.http.get<WarehouseResponse>(`${this.API_URL}/Warehouses/${id}`);
  }

  createWarehouse(payload: CreateWarehouseRequest): Observable<WarehouseResponse> {
    return this.http.post<WarehouseResponse>(`${this.API_URL}/Warehouses`, payload);
  }

  updateWarehouse(id: number, payload: UpdateWarehouseRequest): Observable<WarehouseResponse> {
    return this.http.put<WarehouseResponse>(`${this.API_URL}/Warehouses/${id}`, payload);
  }

  deleteWarehouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Warehouses/${id}`);
  }
}
