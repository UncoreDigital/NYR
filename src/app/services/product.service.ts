import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductApiModel } from '../models/product.model';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { environment } from 'environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductApiModel[]> {
    return this.http.get<ProductApiModel[]>(`${this.API_URL}/Products`);
  }

  getProductsPaged(params: PaginationParams): Observable<PagedResult<ProductApiModel>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PagedResult<ProductApiModel>>(`${this.API_URL}/Products`, { params: httpParams });
  }

  getProductById(id: number): Observable<ProductApiModel> {
    return this.http.get<ProductApiModel>(`${this.API_URL}/Products/${id}`);
  }

  createProduct(payload: any): Observable<ProductApiModel> {
    return this.http.post<ProductApiModel>(`${this.API_URL}/Products`, payload);
  }

  updateProduct(id: number, payload: any): Observable<ProductApiModel> {
    return this.http.put<ProductApiModel>(`${this.API_URL}/Products/${id}`, payload);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Products/${id}`);
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.API_URL}/Products/upload-image`, formData);
  }

  getProductVariants(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/ProductVariants/product/${productId}`);
  }

  getProductVariantsWithAttributes(productId: number): Observable<ProductVariantDto[]> {
    return this.http.get<ProductVariantDto[]>(`${this.API_URL}/ProductVariants/product/${productId}`);
  }

  getProductVariantsWithInventory(productId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/ProductInventory/product/${productId}/variants-with-inventory`);
  }

  updateProductVariant(variantId: number, payload: any): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/ProductVariants/${variantId}`, payload);
  }

  deleteProductVariant(variantId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/ProductVariants/${variantId}`);
  }
}

// DTOs for ProductVariant
export interface ProductVariantDto {
  id: number;
  productId: number;
  variantName: string;
  sku?: string;
  price?: number;
  isEnabled: boolean;
  attributes: ProductVariantAttributeDto[];
}

export interface ProductVariantAttributeDto {
  id: number;
  variationId: number;
  variationName: string;
  variationOptionId: number;
  variationOptionName: string;
  variationOptionValue?: string;
}
