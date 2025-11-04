export interface ScannerResponse {
  id: number;
  scannerId: string;
  scannerName: string;
  scannerPIN: string;
  locationId: number;
  locationName: string;
  createdAt: string;
  isActive: boolean;
  scannerUrl?: string;
}

export interface CreateScannerRequest {
  scannerId: string;
  scannerName: string;
  scannerPIN: string;
  locationId: number;
}

export interface UpdateScannerRequest {
  scannerId: string;
  scannerName: string;
  scannerPIN: string;
  locationId: number;
  isActive: boolean;
}

export interface Scanner {
  scannerId: string;
  scannerName: string;
  scannerPin: string;
  location: string;
}

