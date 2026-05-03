/**
 * Dependency Injection container.
 * Wires concrete implementations to interfaces in one place.
 * All higher-level code imports from here and depends on abstractions.
 */
import { StorageService } from './storage.service';
import { SecureStorageService } from './secure-storage.service';
import { BiometricService } from './biometric.service';
import { PasscodeService } from './passcode.service';
import { PDFService } from './pdf.service';
import { ScannerService } from './scanner.service';
import { ShareService } from './share.service';
import { DocumentRepository } from '../repositories/document.repository';

// Layer 1 – no dependencies
const storageService = new StorageService();
const secureStorageService = new SecureStorageService();

// Layer 2 – depend on layer 1
const biometricService = new BiometricService(storageService);
const passcodeService = new PasscodeService(storageService, secureStorageService);
const documentRepository = new DocumentRepository(storageService);

// Infrastructure services – no cross-dependencies
const pdfService = new PDFService();
const scannerService = new ScannerService();
const shareService = new ShareService();

export {
  storageService,
  secureStorageService,
  biometricService,
  passcodeService,
  documentRepository,
  pdfService,
  scannerService,
  shareService,
};
