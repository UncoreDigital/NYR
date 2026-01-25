import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationResponse, CreateLocationRequest } from '../models/location.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLocations(): Observable<LocationResponse[]> {
    return this.http.get<LocationResponse[]>(`${this.API_URL}/Locations`);
  }

  getLocationsPaged(params: PaginationParams): Observable<PagedResult<LocationResponse>> {
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

    return this.http.get<PagedResult<LocationResponse>>(`${this.API_URL}/Locations`, { params: httpParams });
  }

  getLocationsDetails(): Observable<LocationResponse[]> {
    return this.http.get<LocationResponse[]>(`${this.API_URL}/Locations/locationDetails`);
  }

  getLocationById(id: number): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.API_URL}/Locations/${id}`);
  }

  createLocation(payload: CreateLocationRequest): Observable<LocationResponse> {
    return this.http.post<LocationResponse>(`${this.API_URL}/Locations`, payload);
  }

  updateLocation(id: number, payload: CreateLocationRequest & { isActive: boolean }): Observable<LocationResponse> {
    return this.http.put<LocationResponse>(`${this.API_URL}/Locations/${id}`, payload);
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Locations/${id}`);
  }

  followUpNeeded() {
    return this.http.get<any>(`${this.API_URL}/Locations/follow-up-needed`);
  }
}
