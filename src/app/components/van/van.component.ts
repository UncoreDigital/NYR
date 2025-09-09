import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Van {
  vanName: string;
  vanNumber: string;
}

@Component({
  selector: 'app-van',
  templateUrl: './van.component.html',
  styleUrl: './van.component.css'
})
export class VanComponent implements OnInit {
  displayedColumns: string[] = ['vanName', 'vanNumber', 'actions'];
  dataSource = new MatTableDataSource<Van>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  vans: Van[] = [
    { vanName: 'Van 1', vanNumber: 'VAN123' },
    { vanName: 'Van 2', vanNumber: 'VAN456' },
    { vanName: 'Van 3', vanNumber: 'VAN789' },
    { vanName: 'Van 4', vanNumber: 'VAN101' }, 
    { vanName: 'Van 5', vanNumber: 'VAN112' },
    { vanName: 'Van 6', vanNumber: 'VAN131' },
    { vanName: 'Van 7', vanNumber: 'VAN415' },  
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.vans;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addVan() {
    console.log('Add Van clicked');
    this.router.navigate(['/van/add']);
  }

  viewVan(van: Van) {
    console.log('View Van:', van);
  }

  editVan(van: Van) {
    console.log('Edit Van:', van);
  }

  deleteVan(van: Van) {
    console.log('Delete Van:', van);
  }
}
