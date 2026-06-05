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
  const { isAdFree, isLoading, product, isPurchasing, purchaseRemoveAds, restorePurchases } = useIAPContext();

  if (isLoading) return null;

  const handlePurchase = async () => {
    const result = await purchaseRemoveAds();
    if (!result.success && result.error !== 'Purchase cancelled') {
      Alert.alert('Purchase Failed', result.error ?? 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (!restored) {
      Alert.alert('Restore Failed', 'No previous purchases found or restore failed. Please try again.');
    }
  };

  // Show "Pro plan active" when user has purchased
  if (isAdFree) {
    return (
      <View style={[styles.container, styles.activeContainer]}>
        <View style={styles.left}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <View style={styles.textGroup}>
            <Text style={styles.activeTitle}>Pro Plan Active</Text>
            <Text style={styles.activeSubtitle}>Ads removed · Enjoy ad-free experience</Text>
          </View>
        </View>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name="shield-checkmark-outline" size={20} color={THEME.colors.primary} />
        <View style={styles.textGroup}>
          <Text style={styles.title}>Remove Ads</Text>
          <Text style={styles.subtitle}>One-time purchase · no subscription</Text>
        </View>
      </View>

      <View style={styles.buttonGroup}>
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

        <TouchableOpacity
          style={[styles.btn, styles.restoreBtn]}
          onPress={handleRestore}
          disabled={isPurchasing}
          accessibilityLabel="Restore previous purchase"
        >
          {isPurchasing ? (
            <ActivityIndicator color={THEME.colors.primary} size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore</Text>
          )}
        </TouchableOpacity>
      </View>
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
  activeContainer: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
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
  activeTitle: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold as any,
    color: '#059669',
  },
  subtitle: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  activeSubtitle: {
    fontSize: THEME.fontSize.xs,
    color: '#047857',
    marginTop: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: THEME.spacing.xs,
    alignItems: 'center',
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
  restoreBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  restoreText: {
    color: THEME.colors.primary,
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold as any,
  },
});
