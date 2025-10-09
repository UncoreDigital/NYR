import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupplierApiModel, CreateSupplierRequest, UpdateSupplierRequest } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly API_URL = 'https://localhost:53255/api';

  constructor(private http: HttpClient) { }

  getSuppliers(): Observable<SupplierApiModel[]> {
    return this.http.get<SupplierApiModel[]>(`${this.API_URL}/Suppliers`);
  }

  getSupplierById(id: number): Observable<SupplierApiModel> {
    return this.http.get<SupplierApiModel>(`${this.API_URL}/Suppliers/${id}`);
  }

  createSupplier(payload: CreateSupplierRequest): Observable<SupplierApiModel> {
    return this.http.post<SupplierApiModel>(`${this.API_URL}/Suppliers`, payload);
  }

  updateSupplier(id: number, payload: UpdateSupplierRequest): Observable<SupplierApiModel> {
    return this.http.put<SupplierApiModel>(`${this.API_URL}/Suppliers/${id}`, payload);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Suppliers/${id}`);
  }
}
