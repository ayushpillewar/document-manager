/**
 * IAPContext – React state layer for in-app purchases.
 *
 * Single Responsibility – manages only IAP state and exposes clean purchase actions.
 * Dependency Inversion  – depends on IIAPService abstraction via the DI container.
 * Open/Closed           – swap iapService in container.ts without touching this file.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { IAPProduct, IPurchaseResult } from '../types';
import { iapService } from '../services/container';

export interface IAPContextValue {
  /** True when the user has purchased the "Remove Ads" product. */
  isAdFree: boolean;
  /** True while initializing or fetching the product from the store. */
  isLoading: boolean;
  /** Store product metadata (price, title, etc.). Null until loaded. */
  product: IAPProduct | null;
  /** True while a purchase or restore request is in flight. */
  isPurchasing: boolean;
  /** Initiates the StoreKit purchase flow. */
  purchaseRemoveAds: () => Promise<IPurchaseResult>;
  /** Restores a previous purchase tied to the user's Apple ID. */
  restorePurchases: () => Promise<boolean>;
}

const IAPContext = createContext<IAPContextValue | null>(null);

export function IAPProvider({ children }: { children: React.ReactNode }) {
  const [isAdFree, setIsAdFree] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<IAPProduct | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    (async () => {
      try {
        await iapService.initialize();
        // Check local cache first for instant result, then silently verify
        // with Apple's servers so a previously purchased entitlement is always
        // honoured even after reinstall or device change.
        const [cachedPurchased, prod] = await Promise.all([
          iapService.isRemoveAdsPurchased(),
          iapService.getProduct(),
        ]);
        console.log('IAP initialized. Cached purchased:', cachedPurchased, 'Product:', prod);
        if (isMounted.current) {
          setProduct(prod);
          if (cachedPurchased) {
            console.log('Cached purchase found. Setting ad-free mode.');
            setIsAdFree(true);
          } 
        }
      } catch {
        // IAP unavailable (e.g. simulator, sandbox not configured) — degrade gracefully.
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    })();

    return () => {
      isMounted.current = false;
      iapService.destroy();
    };
  }, []);

  const purchaseRemoveAds = useCallback(async (): Promise<IPurchaseResult> => {
    setIsPurchasing(true);
    try {
      const result = await iapService.requestPurchase();
      if (result.success && isMounted.current) setIsAdFree(true);
      return result;
    } finally {
      if (isMounted.current) setIsPurchasing(false);
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsPurchasing(true);
    try {
      const restored = await iapService.restorePurchases();
      if (restored && isMounted.current) setIsAdFree(true);
      return restored;
    } finally {
      if (isMounted.current) setIsPurchasing(false);
    }
  }, []);

  return (
    <IAPContext.Provider
      value={{ isAdFree, isLoading, product, isPurchasing, purchaseRemoveAds, restorePurchases }}
    >
      {children}
    </IAPContext.Provider>
  );
}

export function useIAPContext(): IAPContextValue {
  const ctx = useContext(IAPContext);
  if (!ctx) throw new Error('useIAPContext must be used within <IAPProvider>');
  return ctx;
}
