import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CustomerService, CustomerApiModel } from '../../services/customer.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { computePageSizeOptions } from 'src/app/utils/paginator-utils';

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

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private toastService: ToastService,
    private dialog: MatDialog
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
        const computedOptions = computePageSizeOptions(this.dataSource.data.length);
        this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
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