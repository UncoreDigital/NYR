import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand } from '../models/brand.model';
import { environment } from 'environment';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.API_URL}/Brands`);
  }

  getBrandById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${this.API_URL}/Brands/${id}`);
  }

  createBrand(payload: any): Observable<Brand> {
    return this.http.post<Brand>(`${this.API_URL}/Brands`, payload);
  }

  updateBrand(id: number, payload: any): Observable<Brand> {
    return this.http.put<Brand>(`${this.API_URL}/Brands/${id}`, payload);
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Brands/${id}`);
  }
}
