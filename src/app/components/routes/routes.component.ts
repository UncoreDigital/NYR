import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { RouteService } from 'src/app/services/route.service';
import { computePageSizeOptions } from '../../utils/paginator-utils';

export interface Routes {
  driverName: string;
  totalStops: string;
  shippingDate: string;
  status: string;
  driverId?: string | number;
}

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css']
})
export class RoutesComponent implements OnInit {
  displayedColumns: string[] = ['driverName', 'totalStops', 'shippingDate', 'status', 'details'];
  dataSource = new MatTableDataSource<Routes>();

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

  routes: Routes[] = [];

  filteredRoutes: Routes[] = [];
  selectedDriver = '';
  selectedDate = '';
  searchTerm = '';
  // Paginator page size options (computed based on data length)
  pageSizeOptions: number[] = [25, 50, 75, 100];
  isLoading: boolean = false;

  constructor(private router: Router, private routeService: RouteService) { }

  ngOnInit(): void {
    this.isLoading = true;
    // Load routes from API. If API fails, keep an empty list to allow local filters to work.
    this.routeService.getRoutes().subscribe({
      next: (res: any[]) => {
        // Map backend response to the local Routes model if necessary
        this.routes = res.map(r => ({
          driverName: r.driverName ?? r.userName ?? r.driver ?? '',
          totalStops: (r.routeStops?.length || 0).toString(),
          shippingDate: r.deliveryDate ? new Date(r.deliveryDate).toISOString().slice(0, 10).split('-').reverse().join('-') : '',
          status: r.status ?? r.routeStatus ?? '',
          routeStops: r.routeStops || [],
          id: r.id || '',
          driverId: r.userId || ''
        }));
        this.filteredRoutes = [...this.routes];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load routes from API:', err);
        // fallback: keep routes empty so UI remains functional
        this.filteredRoutes = [...this.routes];
        this.applyFilters();
        this.isLoading = false;
      }
    });
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

    // Update paginator options based on filtered data length
    const computedOptions = computePageSizeOptions(this.dataSource.data.length);
    this.pageSizeOptions = computedOptions.length ? computedOptions : [25];
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

  viewMap(route: any) {
    route.routeStops.map((x: any) => x.type = x.followupRequestId == null ? "restockrequest" : "followupRequestId" )
    // Navigate to route detail page with route data
    this.router.navigate(['/route-detail'], {
      state: { routeData: route },
      queryParams: {
        selectedDriver: route.driverName,
        totalLocations: route.totalStops,
        selectedDate: route.shippingDate,
        status: route.status,
        routeStops: (route as any).routeStops || [],
        selectedDriverId: route.driverId || 0
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
    this.router.navigate(['/create-route']);
  }
}
