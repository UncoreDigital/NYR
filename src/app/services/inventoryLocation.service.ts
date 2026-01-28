import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryLocationService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllInventoryLocation(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/LocationInventoryData`);
  }

  getAllgroupedByLocation(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/LocationInventoryData/grouped-by-location`);
  }

  getAllgroupedByLocationPaged(params: PaginationParams): Observable<PagedResult<any>> {
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

    return this.http.get<PagedResult<any>>(`${this.API_URL}/LocationInventoryData/grouped-by-location`, { params: httpParams });
  }

  getInventoryLocationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/LocationInventoryData/by-location/${id}`);
  }
}
