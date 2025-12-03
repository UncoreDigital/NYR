export interface ProductVariantAttribute {
  id: number;
  variationId: number;
  variationName: string;
  variationOptionId: number;
  variationOptionName: string;
  variationOptionValue?: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  variantName: string;
  sku?: string;
  price?: number;
  isEnabled: boolean;
  attributes: ProductVariantAttribute[];
}

// Temporary interface for supplies component (to be updated)
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
  variants: ProductVariant[];
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
