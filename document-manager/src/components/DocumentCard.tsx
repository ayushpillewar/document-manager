import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/config';
import { Document } from '../types';
import { formatDate, formatFileSize, getCategoryColor, truncate } from '../utils/helpers';

interface Props {
  document: Document;
  onPress: () => void;
  onShare: () => void;
  onEditCategory: () => void;
  onDelete: () => void;
}

export function DocumentCard({ document, onPress, onShare, onEditCategory, onDelete }: Props) {
  const catColor = getCategoryColor(document.category, THEME.colors.categoryColors);
  const hasThumb = !!document.thumbnailUri;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Thumbnail */}
      <View style={styles.thumb}>
        {hasThumb ? (
          <Image source={{ uri: document.thumbnailUri }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="document-text" size={32} color={THEME.colors.primary} />
          </View>
        )}
        {/* Page count badge */}
        {document.pageCount > 1 && (
          <View style={styles.pageBadge}>
            <Text style={styles.pageBadgeText}>{document.pageCount}p</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {truncate(document.name, 48)}
        </Text>

        <View style={styles.row}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor.bg }]}>
            <Text style={[styles.categoryText, { color: catColor.text }]}>
              {document.category}
            </Text>
          </View>
          {document.isImported && (
            <View style={styles.importedBadge}>
              <Text style={styles.importedText}>Imported</Text>
            </View>
          )}
        </View>

        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={12} color={THEME.colors.textMuted} />
          <Text style={styles.metaText}>{formatDate(document.createdAt)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Ionicons name="document-outline" size={12} color={THEME.colors.textMuted} />
          <Text style={styles.metaText}>{formatFileSize(document.fileSizeKB)}</Text>
        </View>
      </View>

      {/* Actions menu */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onShare} hitSlop={8}>
          <Ionicons name="share-outline" size={20} color={THEME.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onEditCategory} hitSlop={8}>
          <Ionicons name="pricetag-outline" size={20} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={THEME.colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    marginHorizontal: THEME.spacing.md,
    marginVertical: THEME.spacing.xs,
    padding: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadow.md,
  },
  thumb: {
    width: 64,
    height: 80,
    borderRadius: THEME.radius.sm,
    overflow: 'hidden',
    backgroundColor: THEME.colors.primaryLight,
    marginRight: THEME.spacing.md,
    flexShrink: 0,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pageBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: THEME.fontWeight.semibold,
  },
  content: {
    flex: 1,
    gap: THEME.spacing.xs,
  },
  name: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
  },
  categoryText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  importedBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.warningLight,
  },
  importedText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.warning,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
  },
  metaDot: {
    fontSize: THEME.fontSize.xs,
    color: THEME.colors.textMuted,
  },
  actions: {
    gap: THEME.spacing.sm,
    marginLeft: THEME.spacing.sm,
    alignItems: 'center',
  },
  actionBtn: {
    padding: 4,
  },
});
