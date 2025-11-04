import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  WarehouseInventoryResponse, 
  WarehouseListResponse, 
  WarehouseInventoryDetailResponse, 
  AddInventoryRequest, 
  AddBulkInventoryRequest,
  UpdateInventoryRequest 
} from '../models/warehouse-inventory.model';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class WarehouseInventoryService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get list of warehouses with inventory summary
  getWarehouseList(): Observable<WarehouseListResponse[]> {
    return this.http.get<WarehouseListResponse[]>(`${this.API_URL}/WarehouseInventory/warehouses`);
  }

  // Get detailed inventory for a specific warehouse
  getWarehouseInventoryDetails(warehouseId: number): Observable<WarehouseInventoryDetailResponse[]> {
    return this.http.get<WarehouseInventoryDetailResponse[]>(`${this.API_URL}/WarehouseInventory/warehouse/${warehouseId}/inventory`);
  }

  // Add inventory to warehouse
  addInventory(payload: AddInventoryRequest): Observable<WarehouseInventoryResponse> {
    return this.http.post<WarehouseInventoryResponse>(`${this.API_URL}/WarehouseInventory/add-inventory`, payload);
  }

  // Add bulk inventory to warehouse
  addBulkInventory(payload: AddBulkInventoryRequest): Observable<WarehouseInventoryResponse[]> {
    return this.http.post<WarehouseInventoryResponse[]>(`${this.API_URL}/WarehouseInventory/add-bulk-inventory`, payload);
  }

  // Get specific inventory item by ID
  getInventoryById(id: number): Observable<WarehouseInventoryResponse> {
    return this.http.get<WarehouseInventoryResponse>(`${this.API_URL}/WarehouseInventory/${id}`);
  }

  // Update inventory item
  updateInventory(id: number, payload: UpdateInventoryRequest): Observable<WarehouseInventoryResponse> {
    return this.http.put<WarehouseInventoryResponse>(`${this.API_URL}/WarehouseInventory/${id}`, payload);
  }

  // Delete inventory item (soft delete)
  deleteInventory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/WarehouseInventory/${id}`);
  }

  // Get all inventory items for a specific warehouse
  getInventoryByWarehouse(warehouseId: number): Observable<WarehouseInventoryResponse[]> {
    return this.http.get<WarehouseInventoryResponse[]>(`${this.API_URL}/WarehouseInventory/warehouse/${warehouseId}`);
  }

  // Get all inventory items for a specific product
  getInventoryByProduct(productId: number): Observable<WarehouseInventoryResponse[]> {
    return this.http.get<WarehouseInventoryResponse[]>(`${this.API_URL}/WarehouseInventory/product/${productId}`);
  }

  // Check if inventory exists for specific warehouse and product variation
  checkInventoryExists(warehouseId: number, productVariationId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/WarehouseInventory/exists?warehouseId=${warehouseId}&productVariationId=${productVariationId}`);
  }
}
