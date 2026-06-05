import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ErrorCode,
  Purchase,
  PurchaseError,
} from 'react-native-iap';
import { IIAPService, IAPProduct, IPurchaseResult, IStorageService } from '../types';
import { STORAGE_KEYS } from '../constants/config';
import { APP_PREMIUM_IOS_PRODUCT_ID } from '@/constants/constants';

/**
 * StoreKit-backed implementation of IIAPService.
 *
 * Single Responsibility  – communicates with StoreKit only; persists via injected IStorageService.
 * Open/Closed            – swap for a RevenueCat or mock implementation without touching consumers.
 * Dependency Inversion   – depends on IStorageService abstraction, not AsyncStorage directly.
 */
export class IAPService implements IIAPService {
  private isConnected = false;

  constructor(private readonly storage: IStorageService) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.isConnected) return;
    await initConnection();
    this.isConnected = true;
  }

  destroy(): void {
    if (this.isConnected) {
      endConnection();
      this.isConnected = false;
    }
  }

  // ── IIAPProductFetcher ────────────────────────────────────────────────────

  async getProduct(): Promise<IAPProduct | null> {
    await this.initialize();
    const products = await fetchProducts({ skus: [APP_PREMIUM_IOS_PRODUCT_ID] });
    if (!products || !products.length) return null;
    const p = products[0];
    return {
      productId: p.id,
      title: p.title,
      description: p.description,
      price: p.displayPrice,
    };
  }

  // ── IIAPPurchaser ─────────────────────────────────────────────────────────

  /**
   * Initiates a StoreKit purchase flow and resolves when the transaction
   * completes, is cancelled, or errors. Wraps the event-driven listener API
   * into a single promise so callers stay free of listener management.
   */
  async requestPurchase(): Promise<IPurchaseResult> {
    await this.initialize();

    return new Promise<IPurchaseResult>((resolve) => {
      let purchaseSub: { remove(): void } | undefined;
      let errorSub: { remove(): void } | undefined;

      const cleanup = () => {
        purchaseSub?.remove();
        errorSub?.remove();
      };

      purchaseSub = purchaseUpdatedListener(async (purchase: Purchase) => {
        if (purchase.productId !== APP_PREMIUM_IOS_PRODUCT_ID) return;
        try {
          await finishTransaction({ purchase, isConsumable: false });
          await this.storage.set(STORAGE_KEYS.removeAdsPurchased, true);
          cleanup();
          resolve({ success: true });
        } catch (e: unknown) {
          cleanup();
          resolve({
            success: false,
            error: (e as Error).message ?? 'Failed to finish transaction',
          });
        }
      });

      errorSub = purchaseErrorListener((error: PurchaseError) => {
        cleanup();
        if (error.code === ErrorCode.UserCancelled) {
          resolve({ success: false, error: 'Purchase cancelled' });
        } else {
          resolve({ success: false, error: error.message ?? 'Purchase failed' });
        }
      });

      requestPurchase({
        request: { apple: { sku: APP_PREMIUM_IOS_PRODUCT_ID } },
        type: 'in-app',
      }).catch((e: unknown) => {
        cleanup();
        resolve({ success: false, error: (e as Error)?.message ?? 'Purchase failed' });
      });
    });
  }

  async restorePurchases(): Promise<boolean> {
    await this.initialize();
    const purchases = await getAvailablePurchases();
    const purchased = purchases.some(
      (p) => p.productId === APP_PREMIUM_IOS_PRODUCT_ID,
    );
    if (purchased) {
      await this.storage.set(STORAGE_KEYS.removeAdsPurchased, true);
    }
    return purchased;
  }

  // ── IIAPStatusChecker ─────────────────────────────────────────────────────

  async isRemoveAdsPurchased(): Promise<boolean> {
    return (await this.storage.get<boolean>(STORAGE_KEYS.removeAdsPurchased)) ?? false;
  }
}

