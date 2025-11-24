export interface VanWithInventorySummaryResponse {
  vanId: number;
  vanName: string;
  vanNumber: string;
  driverName: string;
  totalTransfers: number;
  totalItems: number;
}

export interface VanInventoryItemResponse {
  id: number;
  productId: number;
  productName: string;
  skuCode: string;
  productVariationId: number;
  variationType: string;
  variationValue: string;
  quantity: number;
}

export interface VanInventoryResponse {
  id: number;
  vanId: number;
  vanName: string;
  vanNumber: string;
  driverName: string;
  locationId: number;
  locationName: string;
  customerName: string;
  transferDate: string;
  deliveryDate?: string;
  status: string;
  items: VanInventoryItemResponse[];
}

export interface TransferTrackingResponse {
  id: number;
  vanId: number;
  vanName: string;
  vanNumber: string;
  locationId: number;
  locationName: string;
  customerId: number;
  customerName: string;
  transferDate: string;
  deliveryDate?: string;
  driverName?: string;
  status: string;
  totalItems: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateTransferStatusRequest {
  status: string;
  deliveryDate?: string;
  driverName?: string;
}

export interface CreateVanInventoryRequest {
  vanId: number;
  warehouseId: number;
  locationId?: number; // Optional for future phase
  items: CreateVanInventoryItemRequest[];
}

export interface CreateVanInventoryItemRequest {
  productId: number;
  productVariationId: number;
  quantity: number;
}
