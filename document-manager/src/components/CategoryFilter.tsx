import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, CATEGORIES } from '../constants/config';

interface Props {
  selected: string;
  onSelect: (cat: string) => void;
  /** Optional counts per category */
  counts?: Record<string, number>;
  onShareCategory?: (cat: string) => void;
}

const ALL_CATEGORIES = ['All', ...CATEGORIES] as const;

export function CategoryFilter({ selected, onSelect, counts, onShareCategory }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {ALL_CATEGORIES.map((cat) => {
        const active = selected === cat;
        const count = cat === 'All' ? undefined : counts?.[cat];
        return (
          <View key={cat} style={styles.chipWrapper}>
            <TouchableOpacity
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat}
              </Text>
              {count !== undefined && count > 0 && (
                <View style={[styles.badge, active && styles.badgeActive]}>
                  <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {/* Share category shortcut (shown only for specific categories when active) */}
            {active && cat !== 'All' && onShareCategory && (
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => onShareCategory(cat)}
                hitSlop={8}
              >
                <Ionicons name="share-outline" size={14} color={THEME.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    gap: THEME.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm - 2,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    ...THEME.shadow.sm,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: THEME.colors.border,
    borderRadius: THEME.radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.textSecondary,
  },
  badgeTextActive: {
    color: '#fff',
  },
  shareBtn: {
    width: 24,
    height: 24,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
