import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocationResponse } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly API_URL = 'https://localhost:53255/api';

  constructor(private http: HttpClient) {}

  getLocations(): Observable<LocationResponse[]> {
    return this.http.get<LocationResponse[]>(`${this.API_URL}/Locations`);
  }

  getLocationById(id: number): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.API_URL}/Locations/${id}`);
  }
}
