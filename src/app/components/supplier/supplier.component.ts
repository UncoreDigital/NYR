import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Supplier {
  supplierName: string;
  phoneNumber: string;
  status: boolean;
  email: string;
}

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css'
})
export class SupplierComponent implements OnInit {
  displayedColumns: string[] = ['supplierName', 'phoneNumber', 'email', 'status', 'actions'];
  dataSource = new MatTableDataSource<Supplier>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  suppliers: Supplier[] = [
    { supplierName: 'FastExpress Pvt Ltd', phoneNumber: '123456789', email: 'loepark@gmail.com', status: true },
    { supplierName: 'FastExpress Pvt Ltd', phoneNumber: '123456789', email: 'loepark@gmail.com', status: true },
    { supplierName: 'FastExpress Pvt Ltd', phoneNumber: '123456789', email: 'loepark@gmail.com', status: true },
    { supplierName: 'FastExpress Pvt Ltd', phoneNumber: '123456789', email: 'loepark@gmail.com', status: true },
    { supplierName: 'FastExpress Pvt Ltd', phoneNumber: '123456789', email: 'loepark@gmail.com', status: true },
    { supplierName: 'FastExpress Pvt Ltd', phoneNumber: '123456789', email: 'loepark@gmail.com', status: true },
    { supplierName: 'FastExpress Pvt Ltd', phoneNumber: '123456789', email: 'loepark@gmail.com', status: true },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.suppliers;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addSupplier() {
    console.log('Add Supplier clicked');
    this.router.navigate(['/supplier/add']);
  }

  viewSupplier(supplier: Supplier) {
    console.log('View Supplier:', supplier);
  }

  editSupplier(supplier: Supplier) {
    console.log('Edit Supplier:', supplier);
  }

  deleteSupplier(supplier: Supplier) {
    console.log('Delete Supplier:', supplier);
  }
}
