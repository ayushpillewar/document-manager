import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIAPContext } from '../contexts/iap.context';
import { THEME } from '../constants/config';

/**
 * RemoveAdsButton – UI surface for the "Remove Ads" IAP.
 *
 * Single Responsibility – renders purchase UI and delegates all business logic
 *                         to IAPContext. Has no knowledge of StoreKit.
 * Open/Closed           – styled via StyleSheet; extend appearance without
 *                         touching logic.
 *
 * Returns null when loading or when the purchase already exists (auto-detected
 * silently on startup via IAPContext).
 */
export function RemoveAdsButton() {
  const { isAdFree, isLoading, product, isPurchasing, purchaseRemoveAds } = useIAPContext();

  if (isLoading || isAdFree) return null;

  const handlePurchase = async () => {
    const result = await purchaseRemoveAds();
    if (!result.success && result.error !== 'Purchase cancelled') {
      Alert.alert('Purchase Failed', result.error ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name="shield-checkmark-outline" size={20} color={THEME.colors.primary} />
        <View style={styles.textGroup}>
          <Text style={styles.title}>Remove Ads</Text>
          <Text style={styles.subtitle}>One-time purchase · no subscription</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btn, styles.buyBtn]}
        onPress={handlePurchase}
        disabled={isPurchasing}
        accessibilityLabel={`Buy Remove Ads${product ? ` for ${product.price}` : ''}`}
      >
        {isPurchasing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buyText}>{product ? product.price : 'Buy'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: THEME.radius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 2,
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    flex: 1,
  },
  textGroup: {
    flexShrink: 1,
  },
  title: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold as any,
    color: THEME.colors.primaryDark,
  },
  subtitle: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  btn: {
    borderRadius: THEME.radius.sm,
    paddingHorizontal: THEME.spacing.sm + 2,
    paddingVertical: THEME.spacing.xs + 2,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtn: {
    backgroundColor: THEME.colors.primary,
  },
  buyText: {
    color: '#fff',
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold as any,
  },
});
