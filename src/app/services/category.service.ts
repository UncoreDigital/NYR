import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from 'environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_URL}/Categories`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/Categories/${id}`);
  }

  createCategory(payload: any): Observable<Category> {
    return this.http.post<Category>(`${this.API_URL}/Categories`, payload);
  }

  updateCategory(id: number, payload: any): Observable<Category> {
    return this.http.put<Category>(`${this.API_URL}/Categories/${id}`, payload);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Categories/${id}`);
  }
}
