import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VanResponse, CreateVanRequest, UpdateVanRequest } from '../models/van.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class VanService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVans(): Observable<VanResponse[]> {
    return this.http.get<VanResponse[]>(`${this.API_URL}/Vans`);
  }

  getVansPaged(params: PaginationParams): Observable<PagedResult<VanResponse>> {
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

    return this.http.get<PagedResult<VanResponse>>(`${this.API_URL}/Vans`, { params: httpParams });
  }

  createVan(payload: CreateVanRequest): Observable<VanResponse> {
    return this.http.post<VanResponse>(`${this.API_URL}/Vans`, payload);
  }

  updateVan(id: number, payload: UpdateVanRequest): Observable<VanResponse> {
    return this.http.put<VanResponse>(`${this.API_URL}/Vans/${id}`, payload);
  }

  getVanById(id: number): Observable<VanResponse> {
    return this.http.get<VanResponse>(`${this.API_URL}/Vans/${id}`);
  }

  deleteVan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Vans/${id}`);
  }
}
