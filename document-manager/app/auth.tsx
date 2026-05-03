import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/src/contexts/auth.context';
import { PasscodeInput } from '@/src/components/PasscodeInput';
import { THEME, SPLASH_GRADIENT } from '@/src/constants/config';

type Screen = 'loading' | 'choose_method' | 'setup_passcode' | 'login_biometric' | 'login_passcode';

export default function AuthScreen() {
  const router = useRouter();
  const { isLoading, isSetUp, authMethod, authenticate, setupBiometric, setupPasscode, isBiometricAvailable } =
    useAuthContext();

  const [screen, setScreen] = useState<Screen>('loading');
  const [biometricAvail, setBiometricAvail] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Determine which sub-screen to show
  useEffect(() => {
    if (isLoading) return;
    (async () => {
      const available = await isBiometricAvailable();
      setBiometricAvail(available);

      if (!isSetUp) {
        setScreen('choose_method');
        return;
      }
      if (authMethod === 'biometric') {
        setScreen('login_biometric');
      } else {
        setScreen('login_passcode');
      }
    })();
  }, [isLoading, isSetUp, authMethod, isBiometricAvailable]);

  // Auto-trigger biometric prompt
  useEffect(() => {
    if (screen === 'login_biometric') triggerBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const triggerBiometric = useCallback(async () => {
    const ok = await authenticate();
    if (ok) {
      router.replace('/(tabs)');
    }
  }, [authenticate, router]);

  const handleSetupBiometric = async () => {
    try {
      await setupBiometric();
      const ok = await authenticate();
      if (ok) router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Could not set up biometric authentication.');
    }
  };

  const handleSetupPasscode = async (passcode: string) => {
    try {
      await setupPasscode(passcode);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Could not save passcode.');
    }
  };

  const handleLoginPasscode = async (passcode: string) => {
    const ok = await authenticate(passcode);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setPasscodeError(`Incorrect passcode (attempt ${next})`);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderChooseMethod = () => (
    <View style={styles.content}>
      <View style={styles.iconCircle}>
        <Ionicons name="shield-checkmark" size={44} color="#fff" />
      </View>
      <Text style={styles.heading}>Secure Your Documents</Text>
      <Text style={styles.description}>
        Choose how you want to protect access to DocVault.
      </Text>

      {biometricAvail && (
        <TouchableOpacity style={styles.methodCard} onPress={handleSetupBiometric} activeOpacity={0.85}>
          <View style={styles.methodIcon}>
            <Ionicons name={Platform.OS === 'ios' ? 'finger-print' : 'finger-print'} size={28} color={THEME.colors.primary} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Biometric</Text>
            <Text style={styles.methodSub}>Face ID · Fingerprint · Quick &amp; seamless</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={THEME.colors.textMuted} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.methodCard}
        onPress={() => setScreen('setup_passcode')}
        activeOpacity={0.85}
      >
        <View style={styles.methodIcon}>
          <Ionicons name="keypad-outline" size={28} color={THEME.colors.secondary} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>4-Digit Passcode</Text>
          <Text style={styles.methodSub}>Always available · Works offline</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const renderSetupPasscode = () => (
    <View style={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('choose_method')}>
        <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
      <PasscodeInput
        confirmMode
        title="Create Passcode"
        subtitle="Enter a 4-digit passcode to protect your documents"
        onComplete={handleSetupPasscode}
      />
    </View>
  );

  const renderLoginBiometric = () => (
    <View style={styles.content}>
      <View style={styles.iconCircle}>
        <Ionicons name="finger-print" size={44} color="#fff" />
      </View>
      <Text style={styles.heading}>Welcome Back</Text>
      <Text style={styles.description}>Authenticate to access your documents.</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={triggerBiometric} activeOpacity={0.85}>
        <Ionicons name="finger-print" size={22} color="#fff" />
        <Text style={styles.primaryBtnText}>Authenticate</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginPasscode = () => (
    <View style={styles.content}>
      <View style={styles.iconCircle}>
        <Ionicons name="lock-closed" size={44} color="#fff" />
      </View>
      <PasscodeInput
        title="Enter Passcode"
        subtitle="Enter your 4-digit passcode"
        error={passcodeError}
        onComplete={handleLoginPasscode}
      />
    </View>
  );

  const renderContent = () => {
    switch (screen) {
      case 'loading': return <ActivityIndicator size="large" color="#fff" />;
      case 'choose_method': return renderChooseMethod();
      case 'setup_passcode': return renderSetupPasscode();
      case 'login_biometric': return renderLoginBiometric();
      case 'login_passcode': return renderLoginPasscode();
    }
  };

  return (
    <LinearGradient
      colors={[...SPLASH_GRADIENT]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.bg}
    >
      <SafeAreaView style={styles.safe}>
        {renderContent()}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, justifyContent: 'center' },
  content: {
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
    gap: THEME.spacing.md,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
    ...THEME.shadow.lg,
  },
  heading: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.extrabold,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: THEME.fontSize.base,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.md,
    width: '100%',
    gap: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: THEME.radius.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.bold,
    color: '#fff',
  },
  methodSub: {
    fontSize: THEME.fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radius.full,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    marginTop: THEME.spacing.lg,
    ...THEME.shadow.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.semibold,
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
});
