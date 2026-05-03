import React from 'react';
import { ScrollView, TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/config';

interface Props {
  pages: string[];
  onRemove: (index: number) => void;
}

export function ScanPageStrip({ pages, onRemove }: Props) {
  if (pages.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{pages.length} page{pages.length > 1 ? 's' : ''} added</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {pages.map((uri, i) => (
          <View key={`${uri}-${i}`} style={styles.pageThumb}>
            <Image source={{ uri }} style={styles.pageImage} resizeMode="cover" />
            <Text style={styles.pageNumber}>{i + 1}</Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(i)}
              hitSlop={6}
            >
              <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const THUMB = 64;

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: THEME.spacing.sm,
  },
  label: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
    paddingHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  strip: {
    paddingHorizontal: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  pageThumb: {
    width: THUMB,
    height: THUMB * 1.25,
    borderRadius: THEME.radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 3,
    left: 5,
    fontSize: 10,
    fontWeight: THEME.fontWeight.bold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
