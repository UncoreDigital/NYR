import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WarehouseResponse, CreateWarehouseRequest, UpdateWarehouseRequest } from '../models/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private readonly API_URL = 'https://localhost:53255/api';

  constructor(private http: HttpClient) {}

  getWarehouses(): Observable<WarehouseResponse[]> {
    return this.http.get<WarehouseResponse[]>(`${this.API_URL}/Warehouses`);
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
