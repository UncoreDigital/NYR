import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ScannerService } from '../../services/scanner.service';
import { ScannerResponse } from '../../models/scanner.model';

export interface Scanner {
  id: number;
  scannerId: string;
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
  dataSource = new MatTableDataSource<Scanner>();

  isLoading = false;
  errorMessage = '';
  scanners: Scanner[] = [];
  deletingScannerId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
    private scannerService: ScannerService
  ) { }

  ngOnInit(): void {
    this.loadScanners();
  }

  loadScanners(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.scannerService.getScanners().subscribe({
      next: (apiScanners: ScannerResponse[]) => {
        this.scanners = this.mapApiResponseToScanner(apiScanners);
        this.dataSource.data = this.scanners;
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

  private mapApiResponseToScanner(apiScanners: ScannerResponse[]): Scanner[] {
    return apiScanners.map(apiScanner => ({
      id: apiScanner.id,
      scannerId: apiScanner.scannerId,
      scannerName: apiScanner.scannerName,
      scannerPin: apiScanner.scannerPIN,
      location: apiScanner.locationName,
      scannerUrl: apiScanner.scannerUrl
    }));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
