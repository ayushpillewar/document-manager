import { useEffect, useRef } from 'react';
import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-9763401578858179/6723963665';

export function useInterstitialOnLaunch(): void {
  const shown = useRef(false);

  useEffect(() => {
    let unsubscribeLoaded: (() => void) | undefined;
    let unsubscribeError: (() => void) | undefined;
    let unsubscribeClosed: (() => void) | undefined;

    mobileAds()
      .initialize()
      .then(() => {
        const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, {
          requestNonPersonalizedAdsOnly: false,
        });

        unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          if (!shown.current) {
            shown.current = true;
            interstitial.show();
          }
        });

        unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
          // Ad failed to load — silently fail so the app is unaffected
        });

        unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          // Ad closed
        });

        interstitial.load();
      })
      .catch(() => {
        // SDK init failed — silently fail so the app is unaffected
      });

    return () => {
      unsubscribeLoaded?.();
      unsubscribeError?.();
      unsubscribeClosed?.();
    };
  }, []);
}

