import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '@/src/services/container';
import { STORAGE_KEYS, APP_CONFIG, SPLASH_GRADIENT, THEME } from '@/src/constants/config';

/**
 * Splash / Onboarding screen.
 *
 * Background image:
 *   - Set APP_CONFIG.useSplashBgImage = true in src/constants/config.ts
 *     and place your image at:  assets/images/splash-bg.png
 *   - Until then a dark gradient is used.
 */
export default function SplashScreen() {
  const router = useRouter();

  const handleContinue = async () => {
    await storageService.set(STORAGE_KEYS.splashAccepted, true);
    router.replace('/auth');
  };

  const content = (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* App brand */}
      <View style={styles.brand}>
        <View style={styles.logoCircle}>
          <Ionicons name="document-text" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>{APP_CONFIG.name}</Text>
        <Text style={styles.tagline}>Your private document vault</Text>
      </View>

      {/* Feature highlights */}
      <View style={styles.features}>
        {[
          { icon: 'scan-outline' as const, label: 'Scan & convert to PDF' },
          { icon: 'lock-closed-outline' as const, label: 'Protected by biometrics or passcode' },
          { icon: 'folder-outline' as const, label: 'Organise by category' },
          { icon: 'share-outline' as const, label: 'Share documents instantly' },
        ].map(({ icon, label }) => (
          <View key={label} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name={icon} size={18} color={THEME.colors.primary} />
            </View>
            <Text style={styles.featureText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Legal */}
      <View style={styles.legal}>
        <Text style={styles.legalText}>
          By continuing you agree to our{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL(APP_CONFIG.termsUrl)}
          >
            Terms of Use
          </Text>{' '}
          and{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL(APP_CONFIG.privacyPolicyUrl)}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
        <Text style={styles.continueBtnText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color={THEME.colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );

  if (APP_CONFIG.useSplashBgImage) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bgImage = require('../assets/images/splash-bg.png');
    return (
      <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay}>{content}</View>
      </ImageBackground>
    );
  }

  return (
    <LinearGradient
      colors={[...SPLASH_GRADIENT]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.bg}
    >
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: Platform.OS === 'android' ? THEME.spacing.xxl : 0,
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadow.lg,
  },
  appName: {
    fontSize: THEME.fontSize.xxxl,
    fontWeight: THEME.fontWeight.extrabold,
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: THEME.fontSize.base,
    color: 'rgba(255,255,255,0.7)',
    marginTop: THEME.spacing.xs,
  },
  features: {
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: THEME.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: THEME.fontSize.base,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: THEME.fontWeight.medium,
  },
  legal: {
    marginBottom: THEME.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.md,
  },
  legalText: {
    fontSize: THEME.fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 20,
  },
  legalLink: {
    color: '#93C5FD',
    fontWeight: THEME.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: '#fff',
    borderRadius: THEME.radius.full,
    paddingVertical: THEME.spacing.md + 2,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadow.lg,
  },
  continueBtnText: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.primary,
  },
});
