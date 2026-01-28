import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  vans: Van[] = [];

  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'vanName';
  sortOrder: 'asc' | 'desc' = 'asc';

  selectedVanName = '';
  searchTerm = '';
  isLoading = false;

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private vanInventoryService: VanInventoryService,
    private toastService: ToastService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.loadVans();
    });
  }

  ngOnInit(): void {
    this.loadVans();
  }

  loadVans(): void {
    this.isLoading = true;
    
    const searchParts: string[] = [];
    if (this.selectedVanName) {
      searchParts.push(this.selectedVanName);
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

    this.vanInventoryService.getVansWithTransfersPaged(params).subscribe({
      next: (result) => {
        if (!result || !result.data) {
          console.error('Invalid response structure:', result);
          this.toastService.error('Error', 'Invalid response from server');
          this.isLoading = false;
          return;
        }
        this.vans = result.data.map((van: VanWithInventorySummaryResponse) => ({
          id: van.vanId,
          vanName: van.vanName,
          vanNumber: van.vanNumber,
          driverName: van.driverName
        }));
        this.totalCount = result.totalCount;
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
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value.trim());
  }

  onVanNameFilterChange() {
    this.pageIndex = 0;
    this.loadVans();
  }

  getUniqueVanNames(): string[] {
    return [...new Set(this.vans.map(van => van.vanName))].sort();
  }

  resetFilters() {
    this.selectedVanName = '';
    this.searchTerm = '';
    this.pageIndex = 0;
    this.loadVans();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVans();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadVans();
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      vanName: 'vanName',
      vanNumber: 'vanNumber',
      driverName: 'driverName'
    };
    return columnMap[column] || 'vanName';
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
}
