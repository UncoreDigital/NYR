export interface ScannerResponse {
  id: number;
  serialNo: string;
  scannerName: string;
  scannerPIN: string;
  scannerUrl?: string;
  locationId: number;
  locationName: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreateScannerRequest {
  serialNo: string;
  scannerName: string;
  scannerPIN: string;
  scannerUrl?: string;
  locationId: number;
}

export interface UpdateScannerRequest {
  serialNo: string;
  scannerName: string;
  scannerPIN: string;
  scannerUrl?: string;
  locationId: number;
  isActive: boolean;
}

export interface Scanner {
  serialNo: string;
  scannerName: string;
  scannerPin: string;
  scannerUrl?: string;
  location: string;
}

