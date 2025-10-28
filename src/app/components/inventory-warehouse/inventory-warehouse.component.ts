import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
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
  dataSource = new MatTableDataSource<inventoryWarehouse>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    this.router.navigate(['/inwarehouse/add']);
  }
}

