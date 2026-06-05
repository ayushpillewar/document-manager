/**
 * All TypeScript interfaces and types.
 * Follows Interface Segregation Principle — small, focused contracts.
 */

// ── Document domain ─────────────────────────────────────────────────────────

export interface Document {
  id: string;
  name: string;
  category: string;
  /** Local file URIs of processed page images */
  pages: string[];
  /** Local URI of the generated PDF */
  pdfUri: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  pageCount: number;
  /** First-page URI used as the card thumbnail */
  thumbnailUri: string;
  fileSizeKB: number;
  /** True when imported from device storage (not scanned) */
  isImported?: boolean;
}

export interface DocumentCreateInput {
  name: string;
  category: string;
  pages: string[]; // raw URIs from camera / image picker
}

// ── Storage (ISP: separate read and write) ──────────────────────────────────

export interface IStorageReader {
  get<T>(key: string): Promise<T | null>;
}

export interface IStorageWriter {
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface IStorageService extends IStorageReader, IStorageWriter {
  clear(): Promise<void>;
}

// ── Secure storage ──────────────────────────────────────────────────────────

export interface ISecureStorageService {
  getSecure(key: string): Promise<string | null>;
  setSecure(key: string, value: string): Promise<void>;
  deleteSecure(key: string): Promise<void>;
}

// ── Auth (ISP: separate authenticate and setup) ─────────────────────────────

export interface IAuthProvider {
  isAvailable(): Promise<boolean>;
  isSetUp(): Promise<boolean>;
  authenticate(credential?: string): Promise<AuthResult>;
}

export interface IAuthSetupProvider {
  setup(credential?: string): Promise<void>;
  reset(): Promise<void>;
}

export type AuthMethod = 'biometric' | 'passcode' | 'none';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  authMethod: AuthMethod;
  isSetUp: boolean;
  isLoading: boolean;
}

// ── Document repository (ISP: separate read and write) ──────────────────────

export interface IDocumentReader {
  getAll(): Promise<Document[]>;
  getById(id: string): Promise<Document | null>;
  getByCategory(category: string): Promise<Document[]>;
  search(query: string): Promise<Document[]>;
}

export interface IDocumentWriter {
  save(doc: Document): Promise<void>;
  update(patch: Partial<Document> & { id: string }): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IDocumentRepository extends IDocumentReader, IDocumentWriter {}

// ── PDF service ─────────────────────────────────────────────────────────────

export interface IPDFService {
  createFromImages(imageUris: string[], documentName: string): Promise<string>;
  getFileSizeKB(fileUri: string): Promise<number>;
}

// ── Scanner service ─────────────────────────────────────────────────────────

export interface IScannerService {
  processImage(uri: string, quality?: number): Promise<string>;
}

// ── Share service ───────────────────────────────────────────────────────────

export interface IShareService {
  shareFile(uri: string, title?: string): Promise<void>;
  isAvailable(): Promise<boolean>;
}

// ── In-App Purchase (ISP: split into focused contracts) ─────────────────────

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
}

export interface IPurchaseResult {
  success: boolean;
  error?: string;
}

/** Fetches product metadata from the store. */
export interface IIAPProductFetcher {
  getProduct(): Promise<IAPProduct | null>;
}

/** Initiates and restores purchases. */
export interface IIAPPurchaser {
  requestPurchase(): Promise<IPurchaseResult>;
  restorePurchases(): Promise<boolean>;
}

/** Reads cached purchase entitlement status. */
export interface IIAPStatusChecker {
  isRemoveAdsPurchased(): Promise<boolean>;
}

/**
 * Composed IAP service interface.
 * Open/Closed: swap the concrete implementation (StoreKit, mock, RevenueCat)
 * without modifying any consumer.
 */
export interface IIAPService extends IIAPProductFetcher, IIAPPurchaser, IIAPStatusChecker {
  initialize(): Promise<void>;
  destroy(): void;
}
