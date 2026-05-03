import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/config';

interface Props {
  visible: boolean;
  lastPageUri: string | null;
  onAddPage: () => void;
  onComplete: () => void;
  onCancel: () => void;
  pageCount: number;
}

export function AddPagePrompt({
  visible,
  lastPageUri,
  onAddPage,
  onComplete,
  onCancel,
  pageCount,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Preview of last captured page */}
          {lastPageUri ? (
            <Image source={{ uri: lastPageUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Ionicons name="checkmark-circle" size={48} color={THEME.colors.success} />
            </View>
          )}

          <Text style={styles.title}>Page {pageCount} captured</Text>
          <Text style={styles.subtitle}>What would you like to do next?</Text>

          <View style={styles.btnGroup}>
            <TouchableOpacity style={styles.btnPrimary} onPress={onAddPage} activeOpacity={0.85}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
              <Text style={styles.btnPrimaryText}>Scan Next Page</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSuccess} onPress={onComplete} activeOpacity={0.85}>
              <Ionicons name="document-text-outline" size={20} color="#fff" />
              <Text style={styles.btnPrimaryText}>Create PDF  ({pageCount} page{pageCount > 1 ? 's' : ''})</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={onCancel} activeOpacity={0.75}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: THEME.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.lg,
    width: '100%',
    alignItems: 'center',
    ...THEME.shadow.lg,
  },
  preview: {
    width: 120,
    height: 160,
    borderRadius: THEME.radius.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 2,
    borderColor: THEME.colors.border,
  },
  previewPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  btnGroup: {
    width: '100%',
    gap: THEME.spacing.sm,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.md,
    ...THEME.shadow.sm,
  },
  btnSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.success,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.md,
    ...THEME.shadow.sm,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
  },
  btnCancel: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  btnCancelText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.fontWeight.medium,
  },
});
