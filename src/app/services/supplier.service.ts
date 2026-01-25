import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupplierApiModel, CreateSupplierRequest, UpdateSupplierRequest } from '../models/supplier.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSuppliers(): Observable<SupplierApiModel[]> {
    return this.http.get<SupplierApiModel[]>(`${this.API_URL}/Suppliers`);
  }

  getSuppliersPaged(params: PaginationParams): Observable<PagedResult<SupplierApiModel>> {
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

    return this.http.get<PagedResult<SupplierApiModel>>(`${this.API_URL}/Suppliers`, { params: httpParams });
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
