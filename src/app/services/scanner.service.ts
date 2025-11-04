import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScannerResponse, CreateScannerRequest, UpdateScannerRequest } from '../models/scanner.model';
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

