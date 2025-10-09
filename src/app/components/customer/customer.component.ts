import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { CustomerService, CustomerApiModel } from '../../services/customer.service';
import { ToastService } from '../../services/toast.service';

export interface Customer {
  id: number;
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

  isLoading = false;

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.fetchCustomers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers: CustomerApiModel[]) => {
        const mapped: Customer[] = customers.map(c => ({
          id: c.id,
          companyName: c.companyName,
          contactName: c.contactName,
          address: this.composeAddress(c),
          phoneNumber: this.composePhone(c)
        }));
        this.dataSource.data = mapped;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load customers', error);
        this.toastService.error('Error', 'Failed to load customers');
        this.isLoading = false;
      }
    });
  }

  composeAddress(c: CustomerApiModel): string {
    const parts = [c.addressLine1, c.addressLine2, c.city, c.state, c.zipCode]
      .filter(Boolean);
    return parts.join(', ');
  }

  composePhone(c: CustomerApiModel): string {
    const business = (c.businessPhone || '').trim();
    const mobile = (c.mobilePhone || '').trim();
    if (business && mobile) {
      return business === mobile ? business : `${business} / ${mobile}`;
    }
    return business || mobile || '';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addCustomer() {
    this.router.navigate(['/customer/add']);
  }

  viewCustomer(customer: Customer) {
    // placeholder for view action
  }

  editCustomer(customer: Customer) {
    this.router.navigate(['/customer/edit', customer.id]);
  }

  deleteCustomer(customer: Customer) {
    const confirmed = confirm(`Are you sure you want to delete "${customer.companyName}"? This action cannot be undone.`);
    if (!confirmed) return;

    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Customer deleted successfully');
        this.fetchCustomers(); // Refresh the list
      },
      error: (error) => {
        console.error('Failed to delete customer', error);
        const message = error?.error?.message || 'Failed to delete customer';
        this.toastService.error('Error', message);
      }
    });
  }
}