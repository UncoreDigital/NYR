import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VanResponse, CreateVanRequest, UpdateVanRequest } from '../models/van.model';
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
