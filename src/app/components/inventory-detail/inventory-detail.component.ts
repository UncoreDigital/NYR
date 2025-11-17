import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseInventoryService } from '../../services/warehouse-inventory.service';
import { WarehouseInventoryDetailResponse } from '../../models/warehouse-inventory.model';
import { TransferInventoryService } from '../../services/transfer-inventory.service';

export interface inventoryLocation {
  productName: string,
  skucode: string,
  variationType: string,
  variationValue: string,
  //colour: string,
  quantity: number,
}

@Component({
  selector: 'app-inventory-detail',
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.css'
})
export class InventoryDetailComponent implements OnInit {
  displayedColumns: string[] = ['productName', 'skucode', 'variationType', 'variationValue', 'quantity'];
  dataSource = new MatTableDataSource<inventoryLocation>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  inventoryLocation: inventoryLocation[] = [];
  selectedVan: string = '';
  searchValue: string = '';
  loading = false;
  // Navigation context
  sourceContext: string = '';
  sourceTitle: string = '';
  breadcrumbItems: any[] = [];
  warehouseId: number | null = null;
  locationId: number | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private warehouseInventoryService: WarehouseInventoryService,
    private transferInventoryService: TransferInventoryService
  ) { }

  ngOnInit(): void {
    // Initialize with default values
    this.sourceContext = 'warehouse';
    this.sourceTitle = 'Avetis';
    this.setupBreadcrumb();
    
    // Override with query params if provided
    this.route.queryParams.subscribe((params: any) => {
      if (Object.keys(params).length > 0) {
        this.sourceContext = params['context'] || 'warehouse';
        this.sourceTitle = params['title'] || 'Inventory Details';
        
        if (this.sourceContext === 'location') {
          this.locationId = params['id'] ? parseInt(params['id']) : null;
        } else {
          this.warehouseId = params['id'] ? parseInt(params['id']) : null;
        }
        
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
    if (this.sourceContext === 'location' && this.locationId) {
      // Load transfer inventory items for location
      this.loading = true;
      this.transferInventoryService.getTransferItemsByLocationId(this.locationId).subscribe({
        next: (items) => {
          this.inventoryLocation = items.map(item => ({
            productName: item.productName,
            skucode: item.skuCode || '',
            variationType: item.variationType || 'N/A',
            variationValue: item.variationValue || 'N/A',
            quantity: item.quantity
          }));
          this.dataSource.data = this.inventoryLocation;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading location inventory:', error);
          this.loading = false;
        }
      });
    } else if (this.sourceContext === 'warehouse' && this.warehouseId) {
      // Load warehouse inventory details
      this.loading = true;
      this.warehouseInventoryService.getWarehouseInventoryDetails(this.warehouseId).subscribe({
        next: (inventoryDetails: WarehouseInventoryDetailResponse[]) => {
          this.inventoryLocation = inventoryDetails.map(item => ({
            productName: item.productName,
            skucode: item.productSKU,
            variationType: item.variationType,
            variationValue: item.variationValue,
            quantity: item.quantity
          }));
          this.dataSource.data = this.inventoryLocation;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading warehouse inventory details:', error);
          this.loading = false;
        }
      });
    } else {
      // Fallback to empty data
      this.dataSource.data = [];
    }
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