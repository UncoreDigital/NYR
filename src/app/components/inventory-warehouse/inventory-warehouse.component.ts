import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { WarehouseInventoryService } from '../../services/warehouse-inventory.service';
import { WarehouseListResponse } from '../../models/warehouse-inventory.model';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';

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
  dataSource = new MatTableDataSource<inventoryWarehouse>();

  private _paginator!: MatPaginator;
  private _sort!: MatSort;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this._paginator = paginator;
      this.dataSource.paginator = this._paginator;
    }
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this._sort = sort;
      this.dataSource.sort = this._sort;
    }
  }
  pageSizeOptions: number[] = [25, 50, 75, 100];

  filteredWarehouses: inventoryWarehouse[] = [];
  selectedWarehouseName = '';
  searchTerm = '';
  loading = false;

  inventoryWarehouse: inventoryWarehouse[] = [];

  constructor(
    private router: Router,
    private warehouseInventoryService: WarehouseInventoryService
  ) { }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading = true;
    this.warehouseInventoryService.getWarehouseList().subscribe({
      next: (warehouses: WarehouseListResponse[]) => {
        this.inventoryWarehouse = warehouses.map(warehouse => ({
          id: warehouse.id,
          warehouseName: warehouse.name,
          warehouseAddress: warehouse.addressLine1,
          city: warehouse.city,
          state: warehouse.state,
          zipCode: warehouse.zipCode,
          country: 'USA' // Default country
        }));
        this.filteredWarehouses = [...this.inventoryWarehouse];
        this.dataSource.data = this.filteredWarehouses;
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.inventoryWarehouse];

    // Apply warehouse name filter
    if (this.selectedWarehouseName) {
      filtered = filtered.filter(warehouse => 
        warehouse.warehouseName === this.selectedWarehouseName
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(warehouse =>
        warehouse.warehouseName.toLowerCase().includes(searchLower) ||
        warehouse.warehouseAddress.toLowerCase().includes(searchLower) ||
        warehouse.city.toLowerCase().includes(searchLower) ||
        warehouse.state.toLowerCase().includes(searchLower) ||
        warehouse.zipCode.toLowerCase().includes(searchLower)
      );
    }

    this.filteredWarehouses = filtered;
    this.dataSource.data = this.filteredWarehouses;
    this.updatePagination();
  }

  onWarehouseNameFilterChange() {
    this.applyFilters();
  }

  getUniqueWarehouseNames(): string[] {
    return [...new Set(this.inventoryWarehouse.map(warehouse => warehouse.warehouseName))].sort();
  }

  resetFilters() {
    this.selectedWarehouseName = '';
    this.searchTerm = '';
    this.applyFilters();
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

  updatePagination() {
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
  }
}

