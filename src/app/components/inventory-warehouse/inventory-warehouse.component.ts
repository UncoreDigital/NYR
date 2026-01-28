import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WarehouseInventoryService } from '../../services/warehouse-inventory.service';
import { WarehouseListResponse } from '../../models/warehouse-inventory.model';

export interface inventoryWarehouse {
  warehouseName: string;
  warehouseAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  id: number;
}

@Component({
  selector: 'app-inventory-warehouse',
  templateUrl: './inventory-warehouse.component.html',
  styleUrl: './inventory-warehouse.component.css'
})
export class InventoryWarehouseComponent implements OnInit {
  displayedColumns: string[] = ['warehouseName', 'warehouseAddress', 'city', 'state', 'zipCode', 'actions'];
  warehouses: inventoryWarehouse[] = [];

  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'warehouseName';
  sortOrder: 'asc' | 'desc' = 'asc';

  selectedWarehouseName = '';
  searchTerm = '';
  loading = false;

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private warehouseInventoryService: WarehouseInventoryService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.loadWarehouses();
    });
  }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading = true;
    const searchParts: string[] = [];
    if (this.selectedWarehouseName) {
      searchParts.push(this.selectedWarehouseName);
    }
    if (this.searchTerm) {
      searchParts.push(this.searchTerm);
    }
    const search = searchParts.join(' ');

    const params = {
      pageNumber: this.pageIndex + 1, // Backend uses 1-based indexing
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: search || undefined
    };

    this.warehouseInventoryService.getWarehouseListPaged(params).subscribe({
      next: (result) => {
        this.warehouses = result.data.map((warehouse: WarehouseListResponse) => ({
          id: warehouse.id,
          warehouseName: warehouse.name,
          warehouseAddress: warehouse.addressLine1,
          city: warehouse.city,
          state: warehouse.state,
          zipCode: warehouse.zipCode,
          country: 'USA' // Default country
        }));
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value.trim());
  }

  onWarehouseNameFilterChange() {
    this.pageIndex = 0;
    this.loadWarehouses();
  }

  getUniqueWarehouseNames(): string[] {
    return [...new Set(this.warehouses.map(warehouse => warehouse.warehouseName))].sort();
  }

  resetFilters() {
    this.selectedWarehouseName = '';
    this.searchTerm = '';
    this.pageIndex = 0;
    this.loadWarehouses();
  }

  addInventory() {
    console.log('Add Warehouse clicked');
    this.router.navigate(['/inwarehouse/add']);
  }

  viewInventoryWarehouse(inventoryWarehouse: inventoryWarehouse) {
    console.log('View Warehouse:', inventoryWarehouse);
    this.router.navigate(['/inventory-detail'], {
      queryParams: {
        context: 'warehouse',
        title: inventoryWarehouse.warehouseName || 'Warehouse Details',
        id: inventoryWarehouse.id
      }
    });
  }

  editInventoryWarehouse(inventoryWarehouse: inventoryWarehouse) {
    console.log('Edit Warehouse:', inventoryWarehouse);
    this.router.navigate(['/inwarehouse/edit', inventoryWarehouse.id]);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadWarehouses();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadWarehouses();
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      warehouseName: 'name',
      warehouseAddress: 'addressLine1',
      city: 'city',
      state: 'state',
      zipCode: 'zipCode'
    };
    return columnMap[column] || 'name';
  }
}

