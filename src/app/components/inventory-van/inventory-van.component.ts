import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';
import { VanInventoryService } from '../../services/van-inventory.service';
import { VanWithInventorySummaryResponse } from '../../models/van-inventory.model';
import { ToastService } from '../../services/toast.service';

export interface Van {
  vanName: string;
  vanNumber: string;
  driverName: string;
  id: number;
}

@Component({
  selector: 'app-inventory-van',
  templateUrl: './inventory-van.component.html',
  styleUrl: './inventory-van.component.css'
})
export class InventoryVanComponent implements OnInit {
  displayedColumns: string[] = ['vanName', 'vanNumber', 'driverName', 'actions'];
  dataSource = new MatTableDataSource<Van>();

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

  vans: Van[] = [];
  filteredVans: Van[] = [];
  selectedVanName = '';
  searchTerm = '';
  isLoading = false;
  
  // Product variations and transfer cart
  selectedProduct: any = null;
  allVariations: any[] = [];
  filteredVariations: any[] = [];
  transferCart: any[] = [];
  variationSearchTerm: string = '';

  constructor(
    private router: Router,
    private vanInventoryService: VanInventoryService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadVans();
  }

  loadVans(): void {
    this.isLoading = true;
    
    this.vanInventoryService.getVansWithTransfers().subscribe({
      next: (vans: VanWithInventorySummaryResponse[]) => {
        this.vans = vans.map(van => ({
          id: van.vanId,
          vanName: van.vanName,
          vanNumber: van.vanNumber,
          driverName: van.driverName
        }));
        this.filteredVans = [...this.vans];
        this.dataSource.data = this.filteredVans;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vans:', error);
        this.toastService.error('Error', 'Failed to load vans. Please try again.');
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.vans];

    // Apply van name filter
    if (this.selectedVanName) {
      filtered = filtered.filter(van => 
        van.vanName === this.selectedVanName
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(van =>
        van.vanName.toLowerCase().includes(searchLower) ||
        van.vanNumber.toLowerCase().includes(searchLower) ||
        van.driverName.toLowerCase().includes(searchLower)
      );
    }

    this.filteredVans = filtered;
    this.dataSource.data = this.filteredVans;
    this.updatePagination();
  }

  updatePagination() {
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
  }

  onVanNameFilterChange() {
    this.applyFilters();
  }

  getUniqueVanNames(): string[] {
    return [...new Set(this.vans.map(van => van.vanName))].sort();
  }

  resetFilters() {
    this.selectedVanName = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  transferToVan() {
    console.log('Transfer To Van clicked');
    this.router.navigate(['/tovan']);
  }

  viewVan(van: Van) {
    console.log('View Van:', van);
    this.router.navigate(['/inventory-detail'], {
      queryParams: {
        context: 'van',
        title: van.vanName || 'Van Details',
        id: van.id
      }
    });
  }

  applyVariationFilter(event: any): void {
    const filterValue = event.target.value.toLowerCase();
    this.filteredVariations = this.allVariations.filter(variation =>
      variation.variationType.toLowerCase().includes(filterValue) ||
      variation.variationValue.toLowerCase().includes(filterValue)
    );
  }

  addVariationToCart(variation: any): void {
    if (variation.transferQuantity && variation.transferQuantity > 0 && variation.transferQuantity <= variation.availableQuantity) {
      const existingIndex = this.transferCart.findIndex(item => item.variationId === variation.variationId);
      
      if (existingIndex >= 0) {
        this.transferCart[existingIndex].quantity = variation.transferQuantity;
      } else {
        this.transferCart.push({
          productId: this.selectedProduct.id,
          productName: this.selectedProduct.name,
          variationId: variation.variationId,
          variationType: variation.variationType,
          variationValue: variation.variationValue,
          quantity: variation.transferQuantity,
          availableQuantity: variation.availableQuantity
        });
      }
      
      variation.transferQuantity = 0;
      this.toastService.success('Added', 'Item added to transfer cart');
    } else if (variation.transferQuantity > variation.availableQuantity) {
      this.toastService.error('Error', `Quantity cannot exceed available quantity (${variation.availableQuantity})`);
    }
  }

  removeFromTransferCart(index: number): void {
    this.transferCart.splice(index, 1);
    this.toastService.info('Removed', 'Item removed from cart');
  }

  updateCartItemQuantity(index: number, quantity: number): void {
    const item = this.transferCart[index];
    if (quantity > 0 && quantity <= item.availableQuantity) {
      item.quantity = quantity;
    } else if (quantity > item.availableQuantity) {
      this.toastService.error('Error', `Quantity cannot exceed available quantity (${item.availableQuantity})`);
      item.quantity = item.availableQuantity;
    }
  }

  isVariationInCart(variation: any): boolean {
    return this.transferCart.some(item => item.variationId === variation.variationId);
  }
}
