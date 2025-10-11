import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

export interface inventoryLocation {
  productName: string,
  skucode: string,
  size: string,
  side: string,
  colour: string,
  quantity: number,
}

@Component({
  selector: 'app-inventory-detail',
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.css'
})
export class InventoryDetailComponent implements OnInit {
  displayedColumns: string[] = ['productName', 'skucode', 'size', 'side', 'colour', 'quantity'];
  dataSource = new MatTableDataSource<inventoryLocation>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  inventoryLocation: inventoryLocation[] = [
    {
      productName: 'Pneumatic Walking Boot',
      skucode: 'MD-001',
      size: 'L',
      side: 'Universal',
      colour: 'Black',
      quantity: 12,
    },
    {
      productName: 'Pneumatic Walking Boot',
      skucode: 'MD-001',
      size: 'M',
      side: 'Universal',
      colour: 'Black',
      quantity: 12,
    },
    {
      productName: 'Pneumatic Walking Boot',
      skucode: 'MD-001',
      size: 'S',
      side: 'Universal',
      colour: 'Black',
      quantity: 12,
    }
  ];

  selectedVan: string = '';
  searchValue: string = '';
  // Navigation context
  sourceContext: string = '';
  sourceTitle: string = '';
  breadcrumbItems: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Initialize with default values
    this.sourceContext = 'warehouse';
    this.sourceTitle = 'Avetis';
    this.setupBreadcrumb();
    this.dataSource.data = this.inventoryLocation;
    
    // Override with query params if provided
    this.route.queryParams.subscribe((params: any) => {
      if (Object.keys(params).length > 0) {
        this.sourceContext = params['context'] || 'warehouse';
        this.sourceTitle = params['title'] || 'Inventory Details';
        this.setupBreadcrumb();
        this.loadInventoryData();
      }
    });
  }

  setupBreadcrumb(): void {
    switch (this.sourceContext) {
      case 'warehouse':
        this.breadcrumbItems = [
          { label: 'Inventory', route: '/inwarehouse' },
          { label: 'Warehouse', route: '/inwarehouse' },
          { label: this.sourceTitle, route: null }
        ];
        break;
      case 'van':
        this.breadcrumbItems = [
          { label: 'Inventory', route: '/invans' },
          { label: 'Vans', route: '/invans' },
          { label: this.sourceTitle, route: null }
        ];
        break;
      case 'location':
        this.breadcrumbItems = [
          { label: 'Inventory', route: '/inlocation' },
          { label: 'Locations', route: '/inlocation' },
          { label: this.sourceTitle, route: null }
        ];
        break;
      default:
        this.breadcrumbItems = [
          { label: 'Inventory', route: '/inventory' },
          { label: this.sourceTitle, route: null }
        ];
    }
  }

  loadInventoryData(): void {
    // In real application, load data based on context and ID
    // For now, use the existing inventory data
    this.dataSource.data = this.inventoryLocation;
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.searchValue = filterValue;
  }

  onVanFilterChange(value: string) {
    this.selectedVan = value;
    if (value === '') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filter = value.trim().toLowerCase();
    }
  }

  resetFilters() {
    this.selectedVan = '';
    this.searchValue = '';
    this.dataSource.filter = '';
  }

  transferToVan() {
    console.log('Transfer To Van clicked');
    this.router.navigate(['/tolocation']);
  }

  viewVan(location: any): void {
    // this.router.navigate(['/inventory-detail'], {
    //   queryParams: {
    //     context: 'location',
    //     title: location.location || 'Location Details',
    //     id: location.id
    //   }
    // });
  }
}