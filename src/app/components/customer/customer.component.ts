import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerService, CustomerApiModel } from '../../services/customer.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
  customers: Customer[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;
  showCreditCardModal = false;
  selectedCustomer: Customer | null = null;
  
  creditCardData = {
    cardCompanyName: '',
    nameOnCard: '',
    cardNumber: '',
    cardType: '',
    securityCode: '',
    expirationDate: '',
    bankName: '',
    bankPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    accountType: '',
    bankRepName: '',
    accountNumber: '',
    customerSince: '',
    balance: '',
    creditLimit: ''
  };
  pageSizeOptions: number[] = [25, 50, 75, 100];

  // Pagination state
  pageIndex: number = 0;
  pageSize: number = 25;
  totalCount: number = 0;
  sortBy: string = 'companyName';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  // Debounce subject for search
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.pageIndex = 0;
      this.fetchCustomers();
    });
  }

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers(): void {
    this.isLoading = true;
    const params = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.mapColumnToSortField(this.sortBy),
      sortOrder: this.sortOrder,
      search: this.searchTerm || undefined
    };

    this.customerService.getCustomersPaged(params).subscribe({
      next: (result) => {
        this.customers = result.data.map(c => ({
          id: c.id,
          companyName: c.companyName,
          contactName: c.contactName,
          address: this.composeAddress(c),
          phoneNumber: this.composePhone(c)
        }));
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load customers', error);
        this.toastService.error('Error', 'Failed to load customers');
        this.isLoading = false;
      }
    });
  }

  private mapColumnToSortField(column: string): string {
    const columnMap: { [key: string]: string } = {
      'companyName': 'companyName',
      'contactName': 'contactName',
      'address': 'address',
      'phoneNumber': 'phoneNumber'
    };
    return columnMap[column] || 'companyName';
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
    this.searchSubject.next(filterValue.trim());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchCustomers();
  }

  onSortChange(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.pageIndex = 0;
    this.fetchCustomers();
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Customer',
        message: `Are you sure you want to delete customer "${customer.companyName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDelete(customer);
      }
    });
  }

  private performDelete(customer: Customer): void {
    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Customer has been deleted successfully');
        this.fetchCustomers(); // Refresh the list
      },
      error: (error) => {
        console.error('Failed to delete customer', error);
        const message = error?.error?.message || 'Failed to delete customer. Please try again.';
        this.toastService.error('Error', message);
      }
    });
  }

  openCreditCardModal(customer: Customer): void {
    this.selectedCustomer = customer;
    this.showCreditCardModal = true;
    // Reset form data
    this.creditCardData = {
      cardCompanyName: '',
      nameOnCard: '',
      cardNumber: '',
      cardType: '',
      securityCode: '',
      expirationDate: '',
      bankName: '',
      bankPhone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      accountType: '',
      bankRepName: '',
      accountNumber: '',
      customerSince: '',
      balance: '',
      creditLimit: ''
    };
  }

  closeCreditCardModal(): void {
    this.showCreditCardModal = false;
    this.selectedCustomer = null;
  }

  saveCreditCardInfo(): void {
    // Here you would typically save the credit card information
    console.log('Saving credit card info for customer:', this.selectedCustomer);
    console.log('Credit card data:', this.creditCardData);
    
    // Show success message
    this.toastService.success('Success', 'Credit card information saved successfully');
    
    // Close modal
    this.closeCreditCardModal();
  }
}