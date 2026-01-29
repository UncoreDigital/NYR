import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WarehouseInventoryService } from '../../services/warehouse-inventory.service';
import { VanInventoryService } from '../../services/van-inventory.service';
import { InventoryLocationService } from 'src/app/services/inventoryLocation.service';
import { PaginationParams } from '../../models/pagination.model';

export interface inventoryLocation {
  productName: string;
  skucode: string;
  variantName: string;
  variantSku: string;
  quantity: number;
}

@Component({
  selector: 'app-inventory-detail',
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.css'
})
export class InventoryDetailComponent implements OnInit {
  displayedColumns: string[] = ['productName', 'skucode', 'variantName', 'quantity'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  inventoryLocation: inventoryLocation[] = [];
  selectedVan = '';
  loading = false;

  sourceContext = '';
  sourceTitle = '';
  breadcrumbItems: any[] = [];
  warehouseId: number | null = null;
  locationId: number | null = null;
  vanId: number | null = null;

  pageSizeOptions: number[] = [25, 50, 75, 100];
  pageIndex = 0;
  pageSize = 25;
  totalCount = 0;
  sortBy = 'productName';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private warehouseInventoryService: WarehouseInventoryService,
    private vanInventoryService: VanInventoryService,
    private inventoryLocationService: InventoryLocationService,
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.loadInventoryData();
    });
  }

  ngOnInit(): void {
    this.sourceContext = 'warehouse';
    this.sourceTitle = 'Avetis';
    this.setupBreadcrumb();

    this.route.queryParams.subscribe((params: any) => {
      if (Object.keys(params).length > 0) {
        this.sourceContext = params['context'] || 'warehouse';
        this.sourceTitle = params['title'] || 'Inventory Details';

        if (this.sourceContext === 'location') {
          this.locationId = params['id'] ? parseInt(params['id'], 10) : null;
          this.warehouseId = null;
          this.vanId = null;
        } else if (this.sourceContext === 'van') {
          this.vanId = params['id'] ? parseInt(params['id'], 10) : null;
          this.warehouseId = null;
          this.locationId = null;
        } else {
          this.warehouseId = params['id'] ? parseInt(params['id'], 10) : null;
          this.vanId = null;
          this.locationId = null;
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

  private getPaginationParams(): PaginationParams {
    return {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };
  }

  private mapColumnToSortField(column: string): string {
    const map: { [key: string]: string } = {
      productName: 'productName',
      skucode: 'skuCode',
      variantName: 'variantName',
      quantity: 'quantity'
    };
    return map[column] || 'productName';
  }

  loadInventoryData(): void {
    if (this.sourceContext === 'van' && this.vanId != null) {
      this.loading = true;
      this.vanInventoryService.getTransferItemsByVanIdPaged(this.vanId, this.getPaginationParams()).subscribe({
        next: (result) => {
          this.inventoryLocation = result.data.map(item => ({
            productName: item.productName,
            skucode: item.skuCode || '',
            variantName: item.variantName || 'Universal Product',
            variantSku: item.variantSku ?? '-',
            quantity: item.quantity
          }));
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    } else if (this.sourceContext === 'location' && this.locationId != null) {
      this.loading = true;
      this.inventoryLocationService.getInventoryLocationByIdPaged(this.locationId, this.getPaginationParams()).subscribe({
        next: (result) => {
          this.inventoryLocation = result.data.map((item: any) => ({
            productName: item.productName,
            skucode: item.productSKU || '',
            variantName: item.variantName || 'Universal Product',
            variantSku: '-',
            quantity: item.quantity
          }));
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    } else if (this.sourceContext === 'warehouse' && this.warehouseId != null) {
      this.loading = true;
      this.warehouseInventoryService.getWarehouseInventoryDetailsPaged(this.warehouseId, this.getPaginationParams()).subscribe({
        next: (result) => {
          this.inventoryLocation = result.data.map(item => ({
            productName: item.productName,
            skucode: item.productSKU,
            variantName: item.variantName || 'Universal Product',
            variantSku: item.variantSku || '-',
            quantity: item.quantity
          }));
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    } else {
      this.inventoryLocation = [];
      this.totalCount = 0;
    }
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value.trim());
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInventoryData();
  }

  onSortChange(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadInventoryData();
  }

  onVanFilterChange(value: string): void {
    this.selectedVan = value;
  }

  resetFilters(): void {
    this.selectedVan = '';
    this.searchTerm = '';
    this.pageIndex = 0;
    this.loadInventoryData();
  }

  transferToVan(): void {
    if (this.sourceContext === 'location') {
      this.router.navigate(['/tolocation']);
    } else {
      this.router.navigate(['/tolocation']);
    }
  }
}
