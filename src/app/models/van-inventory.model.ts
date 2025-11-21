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
  transferDate: string;
  items: VanInventoryItemResponse[];
}

export interface CreateVanInventoryRequest {
  vanId: number;
  locationId: number;
  items: CreateVanInventoryItemRequest[];
}

export interface CreateVanInventoryItemRequest {
  productId: number;
  productVariationId: number;
  quantity: number;
}
