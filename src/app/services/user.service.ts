import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
import { DriverAvailability, DriverAvailabilityBulkRequest } from '../models/driver-availability.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'https://localhost:53255/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/Users`);
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