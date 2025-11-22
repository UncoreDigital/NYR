import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRoute(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/Routes`, payload);
  }
  
  getRoutes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/Routes`);
  }
}
