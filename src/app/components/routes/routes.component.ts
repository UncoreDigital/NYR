import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Routes {
  driverName: string;
  totalStops: string;
  shippingDate: string;
  status: string;
}

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.css'
})
export class RoutesComponent implements OnInit {
  displayedColumns: string[] = ['driverName', 'totalStops', 'shippingDate', 'status', 'details'];
  dataSource = new MatTableDataSource<Routes>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  routes: Routes[] = [
    { driverName: 'John Doe', totalStops: '5', shippingDate: '2023-10-01', status: 'In Progress' },
    { driverName: 'Jane Smith', totalStops: '3', shippingDate: '2023-10-02', status: 'Completed' },
    { driverName: 'Mike Johnson', totalStops: '4', shippingDate: '2023-10-03', status: 'Not Started' },
    { driverName: 'Emily Davis', totalStops: '6', shippingDate: '2023-10-04', status: 'Draft' },
    { driverName: 'David Wilson', totalStops: '2', shippingDate: '2023-10-05', status: 'Completed' },
    { driverName: 'Sarah Brown', totalStops: '7', shippingDate: '2023-10-06', status: 'Not Started' },
    { driverName: 'Chris Lee', totalStops: '5', shippingDate: '2023-10-07', status: 'In Progress' },
    { driverName: 'Anna White', totalStops: '4', shippingDate: '2023-10-08', status: 'Completed' },
    { driverName: 'Tom Harris', totalStops: '3', shippingDate: '2023-10-09', status: 'Not Started' },
    { driverName: 'Laura Martin', totalStops: '6', shippingDate: '2023-10-10', status: 'In Progress' },
    { driverName: 'James Clark', totalStops: '2', shippingDate: '2023-10-11', status: 'Completed' },
    { driverName: 'Olivia Lewis', totalStops: '5', shippingDate: '2023-10-12', status: 'Not Started' },
  ];

  filteredRoutes: Routes[] = [];
  selectedDriver = '';
  selectedDate = '';
  searchTerm = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.filteredRoutes = [...this.routes];
    this.applyFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.routes];

    // Apply driver filter
    if (this.selectedDriver) {
      filtered = filtered.filter(route =>
        route.driverName === this.selectedDriver
      );
    }

    // Apply date filter
    if (this.selectedDate) {
      filtered = filtered.filter(route =>
        route.shippingDate === this.selectedDate
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(route =>
        route.driverName.toLowerCase().includes(searchLower) ||
        route.totalStops.toLowerCase().includes(searchLower) ||
        route.shippingDate.toLowerCase().includes(searchLower) ||
        route.status.toLowerCase().includes(searchLower)
      );
    }

    this.filteredRoutes = filtered;
    this.dataSource.data = this.filteredRoutes;
  }

  onDriverFilterChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  getUniqueDrivers(): string[] {
    return [...new Set(this.routes.map(route => route.driverName))].sort();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  resetFilters() {
    this.selectedDriver = '';
    this.selectedDate = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  viewMap(route: Routes) {
    // Navigate to route detail page with route data
    this.router.navigate(['/route-detail'], {
      state: { routeData: route },
      queryParams: {
        driverName: route.driverName,
        totalStops: route.totalStops,
        shippingDate: route.shippingDate,
        status: route.status
      }
    });
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'Completed': 'status-delivered',
      'In Progress': 'status-in-transit',
      'Not Started': 'status-default',
      'Draft': 'status-follow-up',
    };
    return classMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Completed ': 'visibility',
      'in-transit': 'visibility',
      'Not Started': ''
    };
    return iconMap[status] || '';
  }


  // Status methods
  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Completed',
      'in-transit': 'In Progress',
      'Not Started': 'Not Started',
      'draft': 'Draft'
    };
    return statusMap[status] || status;
  }

  createRoute() {
    this.router.navigate(['/crate-route']);
  }
}
