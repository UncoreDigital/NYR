import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationResponse, CreateLocationRequest } from '../models/location.model';
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
}
