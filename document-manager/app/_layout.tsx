import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '@/src/contexts/auth.context';
import { IAPProvider } from '@/src/contexts/iap.context';
import { useIAPContext } from '@/src/contexts/iap.context';
import { useInterstitial } from '@/src/components/AdMob';
import { TrackingService } from '@/src/services/tracking.service';

function AppContent() {
  const { isAdFree } = useIAPContext();
  useInterstitial(isAdFree);
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    TrackingService.requestPermission();
  }, []);

  return (
    <AuthProvider>
      <IAPProvider>
        <AppContent />
      </IAPProvider>
    </AuthProvider>
  );
}

