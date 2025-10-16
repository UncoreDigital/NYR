import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

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

  inventoryWarehouse: inventoryWarehouse[] = [
    { warehouseName: 'Warehouse 1', warehouseAddress: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA', id: 1 },
    { warehouseName: 'Warehouse 2', warehouseAddress: '456 Elm St', city: 'Los Angeles', state: 'CA', zipCode: '90001', country: 'USA', id: 2 },
    { warehouseName: 'Warehouse 3', warehouseAddress: '789 Oak St', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA', id: 3 },
    { warehouseName: 'Warehouse 4', warehouseAddress: '101 Pine St', city: 'Houston', state: 'TX', zipCode: '77001', country: 'USA', id: 4 },
    { warehouseName: 'Warehouse 5', warehouseAddress: '202 Maple St', city: 'Phoenix', state: 'AZ', zipCode: '85001', country: 'USA', id: 5 },
    { warehouseName: 'Warehouse 6', warehouseAddress: '303 Cedar St', city: 'Philadelphia', state: 'PA', zipCode: '19019', country: 'USA', id: 6 },
    { warehouseName: 'Warehouse 7', warehouseAddress: '404 Birch St', city: 'San Antonio', state: 'TX', zipCode: '78201', country: 'USA', id: 7 },  
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.filteredWarehouses = [...this.inventoryWarehouse];
    this.applyFilters();
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

