export interface TransferInventoryLocationResponse {
  locationId: number;
  locationName: string;
  customerId: number;
  customerName: string;
  contactPerson: string;
  locationNumber: string;
}

export interface TransferInventoryItemResponse {
  id: number;
  productId: number;
  productName: string;
  skuCode: string;
  productVariantId?: number;
  variationType?: string;
  variationValue?: string;
  quantity: number;
}

export interface TransferInventoryResponse {
  id: number;
  customerId: number;
  customerName: string;
  locationId: number;
  locationName: string;
  contactPerson: string;
  locationNumber: string;
  transferDate: string;
  createdAt: string;
  isActive: boolean;
  items: TransferInventoryItemResponse[];
}

export interface CreateTransferInventoryRequest {
  customerId: number;
  locationId: number;
  items: CreateTransferInventoryItemRequest[];
}

export interface CreateTransferInventoryItemRequest {
  productId: number;
  productVariantId?: number;
  quantity: number;
}
