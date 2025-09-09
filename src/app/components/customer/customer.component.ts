import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

export interface Customer {
  companyName: string;
  contactName: string;
  address: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  displayedColumns: string[] = ['companyName', 'contactName', 'address', 'phoneNumber', 'actions'];
  dataSource = new MatTableDataSource<Customer>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  customers: Customer[] = [
    { companyName: 'Greenway Medical', contactName: 'Allan', address: '230 Hilltop Blvd, New York', phoneNumber: '123456789' },
    { companyName: 'Greenway Medical', contactName: 'Allan', address: '230 Hilltop Blvd, New York', phoneNumber: '123456789' },
    { companyName: 'Greenway Medical', contactName: 'Allan', address: '230 Hilltop Blvd, New York', phoneNumber: '123456789' },
    { companyName: 'Greenway Medical', contactName: 'Allan', address: '230 Hilltop Blvd, New York', phoneNumber: '123456789' },
    { companyName: 'Greenway Medical', contactName: 'Allan', address: '230 Hilltop Blvd, New York', phoneNumber: '123456789' },
    { companyName: 'Greenway Medical', contactName: 'Allan', address: '230 Hilltop Blvd, New York', phoneNumber: '123456789' },
    { companyName: 'Greenway Medical', contactName: 'Allan', address: '230 Hilltop Blvd, New York', phoneNumber: '123456789' },
    { companyName: 'Greenway Medical', contactName: 'Allan', address: '230 Hilltop Blvd, New York', phoneNumber: '123456789' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.customers;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addCustomer() {
    console.log('Add customer clicked');
    this.router.navigate(['/customer/add']);
  }

  viewCustomer(customer: Customer) {
    console.log('View customer:', customer);
  }

  editCustomer(customer: Customer) {
    console.log('Edit customer:', customer);
  }

  deleteCustomer(customer: Customer) {
    console.log('Delete customer:', customer);
  }
}