import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environment';

export interface FollowupRequestResponse {
  id: number;
  customerId: number;
  customerName: string;
  locationId: number;
  locationName: string;
  status: string;
  followupDate: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface CreateFollowupRequest {
  customerId: number;
  locationId: number;
}

export interface UpdateFollowupRequest {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class FollowupRequestService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllFollowupRequests(): Observable<FollowupRequestResponse[]> {
    return this.http.get<FollowupRequestResponse[]>(`${this.API_URL}/FollowupRequests`);
  }

  getFollowupRequestById(id: number): Observable<FollowupRequestResponse> {
    return this.http.get<FollowupRequestResponse>(`${this.API_URL}/FollowupRequests/${id}`);
  }

  getFollowupRequestsByLocation(locationId: number): Observable<FollowupRequestResponse[]> {
    return this.http.get<FollowupRequestResponse[]>(`${this.API_URL}/FollowupRequests/location/${locationId}`);
  }

  getFollowupRequestsByCustomer(customerId: number): Observable<FollowupRequestResponse[]> {
    return this.http.get<FollowupRequestResponse[]>(`${this.API_URL}/FollowupRequests/customer/${customerId}`);
  }

  getFollowupRequestsByStatus(status: string): Observable<FollowupRequestResponse[]> {
    return this.http.get<FollowupRequestResponse[]>(`${this.API_URL}/FollowupRequests/status/${status}`);
  }

  createFollowupRequest(request: CreateFollowupRequest): Observable<FollowupRequestResponse> {
    return this.http.post<FollowupRequestResponse>(`${this.API_URL}/FollowupRequests`, request);
  }

  updateFollowupRequestStatus(id: number, request: UpdateFollowupRequest): Observable<FollowupRequestResponse> {
    return this.http.put<FollowupRequestResponse>(`${this.API_URL}/FollowupRequests/${id}/status`, request);
  }

  deleteFollowupRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/FollowupRequests/${id}`);
  }
}
