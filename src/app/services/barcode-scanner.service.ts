import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ScanResult {
  barcode: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface ScannerConfig {
  testMode: boolean;
  simulateDelay: boolean;
  delayMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class BarcodeScannerService {
  private scanResultSubject = new BehaviorSubject<ScanResult | null>(null);
  public scanResult$ = this.scanResultSubject.asObservable();
  
  private isScanning = false;
  private scanTimeout: any;
  
  // Test mode configuration
  private config: ScannerConfig = {
    testMode: true, // Enable test mode by default for development
    simulateDelay: true,
    delayMs: 300 // Reduced delay for faster testing
  };

  constructor() {
    this.initializeCipherLabScanner();
  }

  private initializeCipherLabScanner(): void {
    // Initialize CipherLab RS35 scanner
    // The device typically communicates through keyboard wedge or HID interface
    this.setupKeyboardWedgeListener();
  }

  private setupKeyboardWedgeListener(): void {
    // Listen for barcode input from CipherLab RS35 device
    // The device sends barcode data as keyboard input followed by Enter key
    let barcodeBuffer = '';
    let lastInputTime = 0;
    const BARCODE_TIMEOUT = 100; // ms between characters for barcode input

    document.addEventListener('keydown', (event) => {
      if (!this.isScanning) return;

      const currentTime = Date.now();
      
      // If too much time has passed, reset buffer (not a barcode scan)
      if (currentTime - lastInputTime > BARCODE_TIMEOUT && barcodeBuffer.length > 0) {
        barcodeBuffer = '';
      }

      lastInputTime = currentTime;

      // Handle Enter key (end of barcode scan)
      if (event.key === 'Enter' && barcodeBuffer.length > 0) {
        event.preventDefault();
        this.processScanResult(barcodeBuffer.trim());
        barcodeBuffer = '';
        return;
      }

      // Handle regular characters
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        barcodeBuffer += event.key;
      }

      // Handle backspace
      if (event.key === 'Backspace') {
        event.preventDefault();
        barcodeBuffer = barcodeBuffer.slice(0, -1);
      }
    });
  }

  public startScanning(): Observable<ScanResult | null> {
    this.isScanning = true;
    
    // Set a timeout for scanning (30 seconds)
    this.scanTimeout = setTimeout(() => {
      this.stopScanning();
      this.scanResultSubject.next({
        barcode: '',
        timestamp: new Date(),
        success: false,
        error: 'Scan timeout - no barcode detected'
      });
    }, 30000);

    return this.scanResult$.pipe();
  }

  public stopScanning(): void {
    this.isScanning = false;
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
    // Clear any pending scan results
    this.scanResultSubject.next(null);
  }

  private processScanResult(barcode: string): void {
    if (barcode && barcode.length > 0) {
      const result: ScanResult = {
        barcode: barcode,
        timestamp: new Date(),
        success: true
      };
      
      this.scanResultSubject.next(result);
      this.stopScanning();
    }
  }

  public isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  // Alternative method for direct barcode input (if using CipherLab SDK)
  public async scanWithCipherLabSDK(): Promise<ScanResult> {
    return new Promise((resolve, reject) => {
      try {
        // Check if CipherLab SDK is available
        if (typeof (window as any).CipherLab !== 'undefined') {
          const cipherLab = (window as any).CipherLab;
          
          // Initialize scanner
          cipherLab.scanner.initialize((result: any) => {
            if (result.success) {
              // Start scanning
              cipherLab.scanner.startScan((scanResult: any) => {
                if (scanResult.success && scanResult.barcode) {
                  resolve({
                    barcode: scanResult.barcode,
                    timestamp: new Date(),
                    success: true
                  });
                } else {
                  reject({
                    barcode: '',
                    timestamp: new Date(),
                    success: false,
                    error: scanResult.error || 'Scan failed'
                  });
                }
              });
            } else {
              reject({
                barcode: '',
                timestamp: new Date(),
                success: false,
                error: 'Failed to initialize scanner'
              });
            }
          });
        } else {
          // Fallback to keyboard wedge mode
          this.startScanning().subscribe(result => {
            if (result) {
              if (result.success) {
                resolve(result);
              } else {
                reject(result);
              }
            }
          });
        }
      } catch (error) {
        reject({
          barcode: '',
          timestamp: new Date(),
          success: false,
          error: 'Scanner initialization failed: ' + error
        });
      }
    });
  }

  // Test mode methods
  public setTestMode(enabled: boolean): void {
    this.config.testMode = enabled;
  }

  public isTestMode(): boolean {
    return this.config.testMode;
  }

  public simulateScan(barcode: string): void {
    if (!this.isScanning) {
      console.warn('Scanner is not active. Start scanning first.');
      return;
    }

    const delay = this.config.simulateDelay ? this.config.delayMs : 0;
    
    setTimeout(() => {
      this.processScanResult(barcode);
    }, delay);
  }

  public getTestBarcodes(): string[] {
    return [
      '123232432',
      '96321457', 
      'SKU14',
      'TEST002',
      'SAMPLE123',
      'DEMO456'
    ];
  }

  public simulateRandomScan(): void {
    const testBarcodes = this.getTestBarcodes();
    const randomBarcode = testBarcodes[Math.floor(Math.random() * testBarcodes.length)];
    this.simulateScan(randomBarcode);
  }

  public simulateError(errorMessage: string = 'Simulated scan error'): void {
    if (!this.isScanning) {
      console.warn('Scanner is not active. Start scanning first.');
      return;
    }

    this.scanResultSubject.next({
      barcode: '',
      timestamp: new Date(),
      success: false,
      error: errorMessage
    });
    this.stopScanning();
  }
}