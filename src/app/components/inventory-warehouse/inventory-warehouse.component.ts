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

  inventoryWarehouse: inventoryWarehouse[] = [
    { warehouseName: 'Warehouse 1', warehouseAddress: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    { warehouseName: 'Warehouse 2', warehouseAddress: '456 Elm St', city: 'Los Angeles', state: 'CA', zipCode: '90001', country: 'USA' },
    { warehouseName: 'Warehouse 3', warehouseAddress: '789 Oak St', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA' },
    { warehouseName: 'Warehouse 4', warehouseAddress: '101 Pine St', city: 'Houston', state: 'TX', zipCode: '77001', country: 'USA' },
    { warehouseName: 'Warehouse 5', warehouseAddress: '202 Maple St', city: 'Phoenix', state: 'AZ', zipCode: '85001', country: 'USA' },
    { warehouseName: 'Warehouse 6', warehouseAddress: '303 Cedar St', city: 'Philadelphia', state: 'PA', zipCode: '19019', country: 'USA' },
    { warehouseName: 'Warehouse 7', warehouseAddress: '404 Birch St', city: 'San Antonio', state: 'TX', zipCode: '78201', country: 'USA' },  
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.inventoryWarehouse;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addInventory() {
    console.log('Add Warehouse clicked');
    this.router.navigate(['/warehouse/add']);
  }

  viewInventoryWarehouse(inventoryWarehouse: inventoryWarehouse) {
    console.log('View Warehouse:', inventoryWarehouse);
  }

  editInventoryWarehouse(inventoryWarehouse: inventoryWarehouse) {
    console.log('Edit Warehouse:', inventoryWarehouse);
  }
}

