import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export interface Variation {
  id: number;
  variationName: string;
  variationType: string;
}


@Component({
  selector: 'app-variation',
  templateUrl: './variation.component.html',
  styleUrl: './variation.component.css'
})
export class VariationComponent implements OnInit {
  displayedColumns: string[] = ['variationName', 'variationType', 'actions'];
  dataSource = new MatTableDataSource<Variation>();

  isLoading = false;
  errorMessage = '';
  variations: Variation[] = [
    { id: 1, variationName: 'Variation A', variationType: 'Select' },
    { id: 2, variationName: 'Variation B', variationType: 'Text' },
    { id: 3, variationName: 'Variation C', variationType: 'Select' }  
  ];
  deletingVariationId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loadVariations();
  }

  loadVariations(): void {
    this.errorMessage = '';
    this.dataSource.data = this.variations;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addVariation() {
    console.log('Add Variation clicked');
    this.router.navigate(['/variation/add']);
  }

  viewVariation(variation: Variation) {
    console.log('View Variation:', variation);
  }

  editVariation(variation: Variation) {
    console.log('Edit Variation:', variation);
    this.router.navigate(['/variation/edit', variation.id]);
  }

  deleteVariation(variation: Variation) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Variation',
        message: `Are you sure you want to delete variation "${variation.variationName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(variation);
      }
    });
  }

  private performDelete(variation: Variation): void {
    this.deletingVariationId = variation.id;
  }
}

