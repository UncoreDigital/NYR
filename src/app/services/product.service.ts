import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductApiModel } from '../models/product.model';
import { environment } from 'environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductApiModel[]> {
    return this.http.get<ProductApiModel[]>(`${this.API_URL}/Products`);
  }

  getProductById(id: number): Observable<ProductApiModel> {
    return this.http.get<ProductApiModel>(`${this.API_URL}/Products/${id}`);
  }

  createProduct(payload: any): Observable<ProductApiModel> {
    return this.http.post<ProductApiModel>(`${this.API_URL}/Products`, payload);
  }

  updateProduct(id: number, payload: any): Observable<ProductApiModel> {
    return this.http.put<ProductApiModel>(`${this.API_URL}/Products/${id}`, payload);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Products/${id}`);
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.API_URL}/Products/upload-image`, formData);
  }
}
