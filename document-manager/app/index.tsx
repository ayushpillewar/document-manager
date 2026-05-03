import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { storageService } from '@/src/services/container';
import { STORAGE_KEYS, THEME } from '@/src/constants/config';

/**
 * Entry-point screen.
 * Checks persistent state and redirects to the correct initial screen.
 * The user never sees this screen — it renders only a brief loading indicator.
 */
export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const splashAccepted = await storageService.get<boolean>(STORAGE_KEYS.splashAccepted);
      if (!splashAccepted) {
        router.replace('/splash');
        return;
      }
      // Auth setup check is handled inside /auth itself
      router.replace('/auth');
    };
    redirect();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={THEME.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
