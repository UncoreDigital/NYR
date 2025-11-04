export interface WarehouseInventoryResponse {
  id: number;
  warehouseId: number;
  warehouseName: string;
  warehouseAddress: string;
  warehouseCity: string;
  warehouseState: string;
  warehouseZipCode: string;
  productId: number;
  productName: string;
  productSKU: string;
  productVariationId: number;
  variationType: string;
  variationValue: string;
  variationSKU?: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  isActive: boolean;
}

export interface WarehouseListResponse {
  id: number;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
  totalProducts: number;
  totalQuantity: number;
}

export interface WarehouseInventoryDetailResponse {
  id: number;
  productName: string;
  productSKU: string;
  variationType: string;
  variationValue: string;
  variationSKU?: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AddInventoryRequest {
  warehouseId: number;
  productId: number;
  productVariationId: number;
  quantity: number;
  notes?: string;
}

export interface BulkInventoryItem {
  productVariationId: number;
  quantity: number;
  notes?: string;
}

export interface AddBulkInventoryRequest {
  warehouseId: number;
  productId: number;
  inventoryItems: BulkInventoryItem[];
}

export interface UpdateInventoryRequest {
  quantity: number;
  notes?: string;
}

export interface ProductVariationResponse {
  id: number;
  productId: number;
  variationType: string;
  variationValue: string;
  sku?: string;
  priceAdjustment?: number;
  stockQuantity?: number;
  isActive: boolean;
}
