import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, APP_CONFIG } from '../constants/config';

interface Props {
  onComplete: (passcode: string) => void;
  /** When true, shows a "confirm passcode" step before calling onComplete. */
  confirmMode?: boolean;
  title?: string;
  subtitle?: string;
  error?: string;
}

const LEN = APP_CONFIG.passcodeLength;
const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export function PasscodeInput({ onComplete, confirmMode, title, subtitle, error }: Props) {
  const [digits, setDigits] = useState('');
  const [firstPasscode, setFirstPasscode] = useState('');
  const [phase, setPhase] = useState<'enter' | 'confirm'>('enter');
  const [localError, setLocalError] = useState('');
  const shake = new Animated.Value(0);

  const triggerShake = useCallback(() => {
    Vibration.vibrate(400);
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shake]);

  const handleComplete = useCallback(
    (code: string) => {
      if (confirmMode && phase === 'enter') {
        setFirstPasscode(code);
        setPhase('confirm');
        setDigits('');
        return;
      }
      if (confirmMode && phase === 'confirm') {
        if (code !== firstPasscode) {
          setLocalError('Passcodes do not match. Try again.');
          setDigits('');
          setFirstPasscode('');
          setPhase('enter');
          triggerShake();
          return;
        }
      }
      onComplete(code);
    },
    [confirmMode, phase, firstPasscode, onComplete, triggerShake],
  );

  const addDigit = useCallback(
    (digit: string) => {
      if (digits.length >= LEN) return;
      const next = digits + digit;
      setDigits(next);
      setLocalError('');
      if (next.length === LEN) {
        // Small delay so the last dot fills before transitioning
        setTimeout(() => handleComplete(next), 120);
      }
    },
    [digits, handleComplete],
  );

  const removeDigit = useCallback(() => {
    setDigits((d) => d.slice(0, -1));
    setLocalError('');
  }, []);

  // Show external error
  useEffect(() => {
    if (error) {
      setLocalError(error);
      setDigits('');
      triggerShake();
    }
  }, [error, triggerShake]);

  const displayError = localError || error;
  const displayTitle =
    confirmMode && phase === 'confirm' ? 'Confirm Passcode' : (title ?? 'Enter Passcode');
  const displaySubtitle =
    confirmMode && phase === 'confirm'
      ? 'Re-enter your passcode to confirm'
      : subtitle;

  return (
    <View style={styles.container}>
      {displayTitle ? <Text style={styles.title}>{displayTitle}</Text> : null}
      {displaySubtitle ? <Text style={styles.subtitle}>{displaySubtitle}</Text> : null}

      {/* Dots */}
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shake }] }]}>
        {Array.from({ length: LEN }, (_, i) => (
          <View key={i} style={[styles.dot, i < digits.length && styles.dotFilled]} />
        ))}
      </Animated.View>

      {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYPAD.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key, ki) => {
              if (key === '') return <View key={ki} style={styles.keyPlaceholder} />;
              if (key === 'del') {
                return (
                  <TouchableOpacity key={ki} style={styles.keyBtn} onPress={removeDigit} activeOpacity={0.6}>
                    <Ionicons name="backspace-outline" size={24} color={THEME.colors.text} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity key={ki} style={styles.keyBtn} onPress={() => addDigit(key)} activeOpacity={0.6}>
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const BTN = 72;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  title: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: THEME.spacing.lg,
    marginVertical: THEME.spacing.xl,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: THEME.radius.full,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: THEME.colors.primary,
  },
  errorText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.danger,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  keypad: {
    gap: THEME.spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  keyRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  keyBtn: {
    width: BTN,
    height: BTN,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.md,
  },
  keyPlaceholder: {
    width: BTN,
    height: BTN,
  },
  keyText: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
});
