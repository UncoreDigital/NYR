import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  getInventoryLocationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/LocationInventoryData/by-location/${id}`);
  }
}
