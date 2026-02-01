import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { environment } from 'src/environments/environment';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule, MatIconModule],
  standalone: true
})
export class HeaderComponent implements OnInit {
  showUserMenu = false;
  user: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    
    // Subscribe to image update events from profile component
    this.authService.imageUpdated$.subscribe(() => {
      this.loadUserProfile();
    });
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserById(currentUser.id).subscribe({
        next: (userResponse: any) => {
          this.user = {
            id: userResponse.id,
            name: userResponse.name,
            email: userResponse.email,
            phoneNumber: userResponse.phoneNumber,
            role: userResponse.roleName,
            roleName: userResponse.roleName,
            roleId: userResponse.roleId,
            customerId: userResponse.customerId,
            customerName: userResponse.customerName,
            locationId: userResponse.locationId,
            locationName: userResponse.locationName,
            imageUrl: userResponse.imageUrl
          };
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
        }
      });
    }
  }

  getImageUrl(): string {
    if (this.user?.imageUrl) {
      // If it's a full URL, return as is
      if (this.user.imageUrl.startsWith('http')) {
        return this.user.imageUrl;
      }
      // If it's a relative path, combine with API base URL
      const apiBase = environment.apiUrl.replace('/api', ''); // Remove '/api' to get base URL
      return `${apiBase}${this.user.imageUrl}`;
    }
    return './assets/loginImg.png';
  }

  toggleMobileMenu(): void {
    // Emit event to communicate with sidebar
    const event = new CustomEvent('toggleMobileMenu');
    window.dispatchEvent(event);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  viewProfile(): void {
    console.log('View Profile clicked');
    this.router.navigate(['/profile']);
    // Navigate to profile page
    this.showUserMenu = false;
  }

  openSettings(): void {
    // Navigate to settings page
    this.showUserMenu = false;
  }

  logout(): void {
    console.log('Logout clicked');
    // Clear tokens, redirect to login, etc.
    // Clear user session
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = '/login';
    this.showUserMenu = false;
  }

}