import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

export interface Product {
  category: string;
  productName: string;
  description: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {
  displayedColumns: string[] = ['category', 'productName', 'description', 'lastUpdated', 'actions'];
  dataSource = new MatTableDataSource<Product>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  products: Product[] = [
    { category: 'Electronics', productName: 'Smartphone', description: 'Latest model smartphone', lastUpdated: '2024-01-15' },
    { category: 'Home Appliances', productName: 'Vacuum Cleaner', description: 'High power vacuum cleaner', lastUpdated: '2024-02-10' },
    { category: 'Books', productName: 'Angular Development', description: 'Comprehensive guide to Angular', lastUpdated: '2024-03-05' },
    { category: 'Clothing', productName: 'Jeans', description: 'Comfortable blue jeans', lastUpdated: '2024-04-20' },
    { category: 'Toys', productName: 'Action Figure', description: 'Popular superhero action figure', lastUpdated: '2024-05-12' },
    { category: 'Sports', productName: 'Football', description: 'Professional size football', lastUpdated: '2024-06-01' },
    { category: 'Furniture', productName: 'Office Chair', description: 'Ergonomic office chair', lastUpdated: '2024-06-15' },
    { category: 'Groceries', productName: 'Organic Apples', description: 'Fresh organic apples', lastUpdated: '2024-06-20' },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.dataSource.data = this.products;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addProduct() {
    console.log('Add Product clicked');
    this.router.navigate(['/product/add']);
  }

  viewProduct(product: Product) {
    console.log('View Product:', product);
  }

  editProduct(product: Product) {
    console.log('Edit Product:', product);
  }

  deleteProduct(product: Product) {
    console.log('Delete Product:', product);
  }
}
