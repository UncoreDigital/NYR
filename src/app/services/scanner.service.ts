import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScannerResponse, CreateScannerRequest, UpdateScannerRequest } from '../models/scanner.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getScanners(): Observable<ScannerResponse[]> {
    return this.http.get<ScannerResponse[]>(`${this.API_URL}/Scanners`);
  }

  getScannersPaged(params: PaginationParams): Observable<PagedResult<ScannerResponse>> {
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

    return this.http.get<PagedResult<ScannerResponse>>(`${this.API_URL}/Scanners`, { params: httpParams });
  }

  getScannerById(id: number): Observable<ScannerResponse> {
    return this.http.get<ScannerResponse>(`${this.API_URL}/Scanners/${id}`);
  }

  createScanner(payload: CreateScannerRequest): Observable<ScannerResponse> {
    return this.http.post<ScannerResponse>(`${this.API_URL}/Scanners`, payload);
  }

  updateScanner(id: number, payload: UpdateScannerRequest): Observable<ScannerResponse> {
    return this.http.put<ScannerResponse>(`${this.API_URL}/Scanners/${id}`, payload);
  }

  deleteScanner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Scanners/${id}`);
  }
}

