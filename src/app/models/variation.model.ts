export interface VariationOption {
  id: number;
  variationId: number;
  name: string;
  value: string | null;
  isActive: boolean;
}

export interface Variation {
  id: number;
  name: string;
  valueType: string;
  createdAt: string;
  isActive: boolean;
  options: VariationOption[];
}

export interface CreateVariationOptionRequest {
  name: string;
  value: string | null;
}

export interface CreateVariationRequest {
  name: string;
  valueType: string;
  options: CreateVariationOptionRequest[];
}

export interface UpdateVariationOptionRequest {
  id?: number;
  name: string;
  value: string | null;
  isActive: boolean;
}

export interface UpdateVariationRequest {
  name: string;
  valueType: string;
  isActive: boolean;
  options: UpdateVariationOptionRequest[];
}
