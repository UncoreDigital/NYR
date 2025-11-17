export interface ProductVariation {
  id: number;
  productId: number;
  variationType: string;
  variationValue: string;
  createdAt: string;
  isActive: boolean;
}

export interface ProductVariationDetail {
  id: number;
  productId: number | string;
  productName: string;
  size: string;
  side: string;
  colour: string;
  inStock: number;
  quantity: number;
  status: string;
  variationType?: string;
  variationValue?: string;
}

export interface ProductApiModel {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  barcodeSKU: string;
  barcodeSKU2: string;
  barcodeSKU3: string;
  barcodeSKU4: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  supplierId: number;
  supplierName: string;
  price: number;
  showInCatalogue: boolean;
  isUniversal: boolean;
  createdAt: string;
  isActive: boolean;
  variations: ProductVariation[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  brandName: string;
  supplierName: string;
  price: number;
  createdAt: string;
  isActive: boolean;
}
