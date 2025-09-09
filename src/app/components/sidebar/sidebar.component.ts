import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule, MatIconModule],
  standalone: true
})
export class SidebarComponent implements OnInit {
  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', active: false },
    { icon: 'inventory_2', label: 'Inventory', route: '/inventory', active: false },
    { icon: 'route', label: 'Routes', route: '/routes', active: false },
    { icon: 'swap_horiz', label: 'Transfers', route: '/transfers', active: false },
    { icon: 'analytics', label: 'Tracking & Analytics', route: '/analytics', active: false },
    { icon: 'local_shipping', label: 'Supplies', route: '/supplies', active: false }
  ];

  settingsItems = [
    { icon: 'person', label: 'Profile', route: '/profile' },
    { icon: 'people', label: 'Customer', route: '/customer', active: true },
    { icon: 'location_on', label: 'Location', route: '/location' },
    { icon: 'category', label: 'Product', route: '/product' },
    { icon: 'group', label: 'Users', route: '/users' },
    { icon: 'business', label: 'Supplier', route: '/supplier' },
    { icon: 'local_shipping', label: 'Van', route: '/van' },
    { icon: 'warehouse', label: 'Warehouse', route: '/warehouse' }
  ];
  isSettingsOpen = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.updateActiveState();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.updateActiveState();
  }

  private updateActiveState(): void {
    const currentRoute = this.router.url;
    this.menuItems.forEach(item => {
      item.active = item.route === currentRoute;
    });
    this.settingsItems.forEach(item => {
      item.active = item.route === currentRoute;
    });
  }

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
  }
}