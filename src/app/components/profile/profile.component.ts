import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  name = 'John Deo';
  phone = '5623489563';
  email = 'john@yopmail.com';
}
