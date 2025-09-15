import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Transfers {
  locationName: string;
  customerName: string;
  deliveryDate: string;
  driver: string;
  status: string;
}

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.css'
})
export class TransfersComponent implements OnInit {
  displayedColumns: string[] = ['locationName', 'customerName', 'deliveryDate', 'driver', 'status'];
  dataSource = new MatTableDataSource<Transfers>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  transfers: Transfers[] = [
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '17 Jun 2025', driver: 'Nick Danil', status: 'delivered' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '17 Jun 2025', driver: 'Nick Danil', status: 'delivered' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '17 Jun 2025', driver: 'Nick Danil', status: 'in-transit' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'follow-up' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'follow-up-completed' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'follow-up-completed' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'driver-assigned' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'delivered' },
    { locationName: 'Greenway Medical', customerName: 'John deo', deliveryDate: '-', driver: 'Nick Danil', status: 'in-transit' },
  ];
  showFollowUpModal: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.transfers;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addTransfer() {
    console.log('Add Transfers clicked');
    this.router.navigate(['/transfers/add']);
  }

  viewTransfer(transfers: Transfers) {
    console.log('View Transfer:', transfers);
  }

  editTransfer(transfers: Transfers) {
    console.log('Edit Transfer:', transfers);
  }

  deleteTransfer(transfers: Transfers) {
    console.log('Delete Transfer:', transfers);
  }

  // Status methods
  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Delivered',
      'in-transit': 'In transit',
      'follow-up': 'Follow up',
      'follow-up-completed': 'Follow up completed',
      'driver-assigned': 'Driver Assigned'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'delivered': 'status-delivered',
      'in-transit': 'status-in-transit',
      'follow-up': 'status-follow-up',
      'follow-up-completed': 'status-follow-up-completed',
      'driver-assigned': 'status-driver-assigned'
    };
    return classMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'delivered': 'visibility',
      'in-transit': 'visibility',
      'follow-up': '',
      'follow-up-completed': 'chat_bubble',
      'driver-assigned': 'visibility'
    };
    return iconMap[status] || '';
  }

  addFollowUp() {
    this.showFollowUpModal = true;
  }

  saveFollowUp() {
    this.showFollowUpModal = false;
    this.router.navigate(['/routes']);
  }

  transferDetail(iconName: string) {
    if (iconName === 'visibility') {
      this.router.navigate(['/transferDetail']);
    }
  }

  transferToVan() {
    this.router.navigate(['/tovan']);
  }

  transferToLocation() {
    this.router.navigate(['/tolocation']);
  }
}
