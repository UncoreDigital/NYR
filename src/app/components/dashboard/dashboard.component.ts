import { Component, OnInit } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private locationService: LocationService) { }

  ngOnInit(): void {
    //Call [HttpGet("follow-up-needed")] for getting Folllwup requires table
    this.locationService.followUpNeeded().subscribe({
      next: (apiLocations: any[]) => {
        console.log(apiLocations);
      },
      error: (error: any) => {
        console.error('Error loading locations:', error);
      }
    });
    //
  }

}