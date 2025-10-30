import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

export interface RouteStop {
  location: string;
  eta: string;
  items?: number;
  status: 'completed' | 'in-transit' | 'pending';
}

export interface Customer {
  name: string;
  status: string;
  selected: boolean;
}

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, SidebarComponent, HeaderComponent, RouterModule],
  templateUrl: './route-map.component.html',
  styleUrl: './route-map.component.css'
})
export class RouteMapComponent implements OnInit, AfterViewInit {
  @Input() showFullLayout: boolean = true; // Default to true for standalone usage
  routeData: any = null;
  showAddStopModal = false;
  
  routeStops: RouteStop[] = [
    {
      location: 'Howard University',
      eta: '10:00 AM',
      items: 4,
      status: 'completed'
    },
    {
      location: 'Bryant Street',
      eta: '10:30 AM',
      status: 'in-transit'
    },
    {
      location: 'District Vet',
      eta: '11:40 AM',
      status: 'pending'
    }
  ];

  availableCustomers: Customer[] = [
    { name: 'Cervical Collar', status: 'Ready To Ship', selected: false },
    { name: 'Cervical Collar', status: 'Ready To Ship', selected: false },
    { name: 'Cervical Collar', status: 'Ready To Ship', selected: false },
    { name: 'Cervical Collar', status: 'Ready To Ship', selected: false },
    { name: 'Cervical Collar', status: 'Ready To Ship', selected: false },
    { name: 'Cervical Collar', status: 'Ready To Ship', selected: false },
    { name: 'Cervical Collar', status: 'Follow up', selected: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get route data from navigation state or route params
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.routeData = navigation.extras.state['routeData'];
    }
    
    // If no data from navigation, get from route params (for direct URL access)
    this.route.queryParams.subscribe(params => {
      if (params['driverName']) {
        this.routeData = {
          driverName: params['driverName'],
          totalStops: params['totalStops'],
          shippingDate: params['shippingDate'],
          status: params['status']
        };
      }
    });

    // Fallback data if no route data is available
    if (!this.routeData) {
      this.routeData = {
        driverName: 'James Miller',
        totalStops: 3,
        shippingDate: '20/06/2025',
        status: 'In Transit',
        startPoint: 'Warehouse 1',
        distance: '5.1 miles'
      };
    }
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    // Initialize the map here
    // For now, we'll use a placeholder
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="width: 100%; height: 100%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <div style="text-align: center; color: #666;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
            <div>Interactive Map View</div>
            <div style="font-size: 12px; margin-top: 8px;">Map integration will be implemented here</div>
          </div>
        </div>
      `;
    }
  }

  getTotalTime(): string {
    return '23 min';
  }

  goBack(): void {
    this.router.navigate(['/routes']);
  }

  // Modal functions
  openAddStopModal(): void {
    this.showAddStopModal = true;
  }

  closeAddStopModal(): void {
    this.showAddStopModal = false;
    // Reset selections when closing modal
    this.availableCustomers.forEach(customer => customer.selected = false);
  }

  toggleAllCustomers(event: any): void {
    const isChecked = event.target.checked;
    this.availableCustomers.forEach(customer => customer.selected = isChecked);
  }

  areAllCustomersSelected(): boolean {
    return this.availableCustomers.length > 0 && this.availableCustomers.every(customer => customer.selected);
  }

  isSomeCustomersSelected(): boolean {
    return this.availableCustomers.some(customer => customer.selected) && !this.areAllCustomersSelected();
  }

  onCustomerSelectionChange(): void {
    // This method can be used for any additional logic when customer selection changes
  }

  hasSelectedCustomers(): boolean {
    return this.availableCustomers.some(customer => customer.selected);
  }

  addSelectedCustomersToStops(): void {
    const selectedCustomers = this.availableCustomers.filter(customer => customer.selected);
    
    selectedCustomers.forEach((customer, index) => {
      const newStop: RouteStop = {
        location: customer.name,
        eta: this.generateNextETA(),
        items: Math.floor(Math.random() * 5) + 1, // Random number of items between 1-5
        status: 'pending'
      };
      
      this.routeStops.push(newStop);
    });

    // Close modal and reset selections
    this.closeAddStopModal();
  }

  private generateNextETA(): string {
    const currentTime = new Date();
    const randomMinutes = Math.floor(Math.random() * 60) + 30; // Add 30-90 minutes
    currentTime.setMinutes(currentTime.getMinutes() + randomMinutes);
    
    return currentTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
}