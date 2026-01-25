import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Variation, CreateVariationRequest, UpdateVariationRequest } from '../models/variation.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({ providedIn: 'root' })
export class VariationService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVariations(): Observable<Variation[]> {
    return this.http.get<Variation[]>(`${this.API_URL}/Variations`);
  }

  getVariationsPaged(params: PaginationParams): Observable<PagedResult<Variation>> {
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

    return this.http.get<PagedResult<Variation>>(`${this.API_URL}/Variations`, { params: httpParams });
  }

  getActiveVariations(): Observable<Variation[]> {
    return this.http.get<Variation[]>(`${this.API_URL}/Variations/active`);
  }

  getVariationById(id: number): Observable<Variation> {
    return this.http.get<Variation>(`${this.API_URL}/Variations/${id}`);
  }

  createVariation(payload: CreateVariationRequest): Observable<Variation> {
    return this.http.post<Variation>(`${this.API_URL}/Variations`, payload);
  }

  updateVariation(id: number, payload: UpdateVariationRequest): Observable<Variation> {
    return this.http.put<Variation>(`${this.API_URL}/Variations/${id}`, payload);
  }

  deleteVariation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Variations/${id}`);
  }
}
