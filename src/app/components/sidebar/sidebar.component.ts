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
  isInventoryOpen = false;
  isSettingsOpen = false;
  isMobileMenuOpen = false;

  menuItems = [
    { icon: 'home', label: 'Dashboard', route: '/dashboard', active: false },
    { icon: 'inventory_2', label: 'Inventory', route: '/inventory', active: false },
    { icon: 'route', label: 'Routes', route: '/routes', active: false },
    { icon: 'swap_horiz', label: 'Transfers', route: '/transfers', active: false },
    // { icon: 'analytics', label: 'Tracking & Analytics', route: '/analytics', active: false },
    { icon: 'inventory', label: 'Supplies', route: '/supplies', active: false },
  ];

  inventoryItems = [
    { icon: 'warehouse', label: 'Warehouse', route: '/inwarehouse', active: false },
    { icon: 'local_shipping', label: 'Vans', route: '/invans', active: false },
    { icon: 'location_on', label: 'Locations', route: '/inlocation', active: false },
  ];

  settingsItems = [
    { icon: 'person', label: 'Profile', route: '/profile', active: false },
    { icon: 'people', label: 'Customer', route: '/customer', active: false },
    { icon: 'location_on', label: 'Location', route: '/location', active: false },
    { icon: 'category', label: 'Product', route: '/product', active: false },
    { icon: 'group', label: 'Users', route: '/users', active: false },
    { icon: 'business', label: 'Supplier', route: '/supplier', active: false },
    { icon: 'local_shipping', label: 'Van', route: '/van', active: false },
    { icon: 'warehouse', label: 'Warehouse', route: '/warehouse', active: false }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setActiveMenuItem();
    // Listen for window resize to close mobile menu on desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isMobileMenuOpen = false;
      }
    });
    // Listen for toggle event from header
    window.addEventListener('toggleMobileMenu', () => {
      this.toggleMobileMenu();
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  navigate(route: string): void {
    if (route) {
      this.router.navigate([route]);
      this.setActiveMenuItem();
      // Close mobile menu after navigation
      this.closeMobileMenu();
    }
  }

  toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    // Close settings when opening inventory
    if (this.isInventoryOpen) {
      this.isSettingsOpen = false;
    }
  }

  toggleSettings(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
    // Close inventory when opening settings
    if (this.isSettingsOpen) {
      this.isInventoryOpen = false;
    }
  }

  private setActiveMenuItem(): void {
    const currentUrl = this.router.url;
    
    // Reset all active states
    this.menuItems.forEach(item => item.active = false);
    this.inventoryItems.forEach(item => item.active = false);
    this.settingsItems.forEach(item => item.active = false);

    // Check inventory items first
    const activeInventoryItem = this.inventoryItems.find(item => 
      currentUrl.includes(item.route) || 
      (item.route === '/warehouse' && (currentUrl.includes('/warehouse') || currentUrl.includes('/add-inventory')))
    );

    if (activeInventoryItem) {
      activeInventoryItem.active = true;
      // Find and activate the inventory parent menu
      const inventoryMenuItem = this.menuItems.find(item => item.label === 'Inventory');
      if (inventoryMenuItem) {
        inventoryMenuItem.active = true;
      }
      // Keep inventory menu open
      this.isInventoryOpen = true;
      return;
    }

    // Check settings items
    const activeSettingsItem = this.settingsItems.find(item => 
      currentUrl.includes(item.route)
    );

    if (activeSettingsItem) {
      activeSettingsItem.active = true;
      // Keep settings menu open
      this.isSettingsOpen = true;
      return;
    }

    // Check main menu items
    const activeMenuItem = this.menuItems.find(item => 
      item.route && currentUrl.includes(item.route)
    );

    if (activeMenuItem) {
      activeMenuItem.active = true;
    }
  }
}