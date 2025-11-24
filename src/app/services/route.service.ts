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

  // SpokeController integrations
  computeCircuit(payload: any): Observable<any> {
    // POST to Spoke optimize-route (batch optimization)
    return this.http.post<any>(`${this.API_URL}/Spoke/optimize-route`, payload);
  }

  /**
   * Create a plan in Spoke (CreatePlan endpoint).
   * Expected to return plan information such as planId or routeId.
   */
  createPlan(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/Spoke/create-plan`, payload);
  }

  /**
   * Import stops into an existing Spoke route by route id.
   * Endpoint: POST /Spoke/import-stops/{routeId}
   */
  importStopsToRoute(routeId: string | number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/Spoke/import-stops/${routeId}`, payload);
  }

  optimizeRouteById(routeId: string | number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/Spoke/optimize-route/${routeId}`, payload);
  }

  tracking(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/Spoke/tracking`, payload);
  }

  getSpokeRoute(routeId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/Spoke/route/${routeId}`);
  }

  deleteSpokeRoute(routeId: string | number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/Spoke/route/${routeId}`);
  }

  getStopDetails(planId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/Spoke/plans/${planId}/stops`);
  }
}
