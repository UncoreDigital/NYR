import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ScannerService } from '../../services/scanner.service';
import { ScannerResponse } from '../../models/scanner.model';

export interface Scanner {
  id: number;
  serialNo: string;
  scannerName: string;
  location: string;
  scannerPin?: string;
  scannerUrl?: string;
}

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.css'
})

export class ScannerComponent implements OnInit {
  displayedColumns: string[] = ['serialNo', 'scannerName', 'scannerPin', 'location', 'scannerUrl', 'actions'];
  scanners: Scanner[] = [];
  deletingScannerId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  isLoading = false;
  errorMessage = '';
  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  // Debounce subject for search
  private searchSubject = new Subject<string>();
  
  constructor(
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
    private scannerService: ScannerService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.loadScanners();
    });
  }

  ngOnInit(): void {
    this.loadScanners();
  }

  loadScanners(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.scannerService.getScannersPaged(params).subscribe({
      next: (result) => {
        this.scanners = this.mapApiResponseToScanner(result.data);
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading scanners:', error);
        this.toastService.error('Error', 'Failed to load scanners. Please try again.');
        this.errorMessage = 'Failed to load scanners. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'scannerName': 'name',
      'serialNo': 'serialNumber',
      'location': 'locationName'
    };
    return columnMap[column] || 'name';
  }

  private mapApiResponseToScanner(apiScanners: ScannerResponse[]): Scanner[] {
    return apiScanners.map(apiScanner => ({
      id: apiScanner.id,
      serialNo: apiScanner.serialNo,
      scannerName: apiScanner.scannerName,
      scannerPin: apiScanner.scannerPIN,
      location: apiScanner.locationName,
      scannerUrl: apiScanner.scannerUrl
    }));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadScanners();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.loadScanners();
  }

  addScanner() {
    console.log('Add Scanner clicked');
    this.router.navigate(['/scanner/add']);
  }

  viewScanner(scanner: Scanner) {
    console.log('View Scanner:', scanner);
  }

  editScanner(scanner: Scanner) {
    console.log('Edit Scanner:', scanner);
    this.router.navigate(['/scanner/edit', scanner.id]);
  }

  deleteScanner(scanner: Scanner) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Scanner',
        message: `Are you sure you want to delete scanner "${scanner.scannerName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(scanner);
      }
    });
  }

  private performDelete(scanner: Scanner): void {
    this.deletingScannerId = scanner.id;
    this.scannerService.deleteScanner(scanner.id).subscribe({
      next: () => {
        this.deletingScannerId = null;
        this.toastService.success('Success', 'Scanner has been deleted successfully');
        this.loadScanners(); // Refresh the list
      },
      error: (error: any) => {
        this.deletingScannerId = null;
        console.error('Error deleting scanner:', error);
        const message = error.error?.message || 'Failed to delete scanner. Please try again.';
        this.toastService.error('Error', message);
      }
    });
  }
}
