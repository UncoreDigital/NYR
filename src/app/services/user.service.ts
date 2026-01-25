import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserResponse, User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
import { DriverAvailability, DriverAvailabilityBulkRequest } from '../models/driver-availability.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/Users`);
  }

  getUsersPaged(params: PaginationParams): Observable<PagedResult<UserResponse>> {
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

    return this.http.get<PagedResult<UserResponse>>(`${this.API_URL}/Users`, { params: httpParams });
  }

  /**
   * Returns users that appear to be drivers (filters by roleName === 'Driver' case-insensitive).
   * This is a client-side helper in case the API doesn't provide a dedicated drivers endpoint.
   */
  getDrivers(): Observable<UserResponse[]> {
    return this.getUsers().pipe(
      map(users => users.filter(u => (u.roleName || '').toLowerCase() === 'driver'))
    );
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/Users/${id}`);
  }

  updateUser(id: number, userData: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API_URL}/Users/${id}`, userData);
  }

  createUser(payload: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/Users`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Users/${id}`);
  }

  getDriverAvailability(userId: number): Observable<DriverAvailability[]> {
    return this.http.get<DriverAvailability[]>(`${this.API_URL}/Users/${userId}/driver-availability`);
  }

  /**
   * Retrieve all available roles from the API.
   * Endpoint may vary; backend is expected to expose role list at /Roles or /Roles/GetAllRoles.
   */
  getAllRoles(): Observable<Array<{ id: number; name: string }>> {
    // Try the conventional route first
    return this.http.get<Array<{ id: number; name: string }>>(`${this.API_URL}/Roles`);
  }

  saveDriverAvailability(userId: number, availabilityData: DriverAvailabilityBulkRequest): Observable<any> {
    // Convert time strings to TimeSpan format for the API
    const apiPayload = {
      userId: availabilityData.userId,
      days: availabilityData.days,
      startTime: this.convertToTimeSpan(availabilityData.startTime),
      endTime: this.convertToTimeSpan(availabilityData.endTime)
    };
    
    return this.http.post(`${this.API_URL}/Users/${userId}/driver-availability`, apiPayload);
  }

  deleteDriverAvailability(userId: number, availabilityId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/Users/${userId}/driver-availability/${availabilityId}`);
  }

  createIndividualDriverAvailability(userId: number, availabilityData: any): Observable<any> {
    // Convert time strings to TimeSpan format for the API
    const apiPayload = {
      userId: availabilityData.userId,
      dayOfWeek: availabilityData.dayOfWeek,
      startTime: this.convertToTimeSpan(availabilityData.startTime),
      endTime: this.convertToTimeSpan(availabilityData.endTime)
    };
    
    return this.http.post(`${this.API_URL}/Users/${userId}/driver-availability/individual`, apiPayload);
  }

  private convertToTimeSpan(timeString: string): string {
    // Convert "HH:mm" to "HH:mm:ss" format for TimeSpan
    return timeString + ':00';
  }
}