import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, CATEGORIES } from '../constants/config';

interface Props {
  visible: boolean;
  currentCategory: string;
  documentName: string;
  onSave: (category: string) => void;
  onClose: () => void;
}

export function EditCategoryModal({
  visible,
  currentCategory,
  documentName,
  onSave,
  onClose,
}: Props) {
  const [selected, setSelected] = useState(currentCategory);

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Edit Category</Text>
              <Text style={styles.subtitle} numberOfLines={1}>{documentName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {CATEGORIES.map((cat) => {
              const isActive = selected === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.row, isActive && styles.rowActive]}
                  onPress={() => setSelected(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rowText, isActive && styles.rowTextActive]}>
                    {cat}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color={THEME.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: THEME.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radius.xl,
    borderTopRightRadius: THEME.radius.xl,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
    paddingTop: THEME.spacing.sm,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.border,
    alignSelf: 'center',
    marginBottom: THEME.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.fontSize.lg,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    maxWidth: 220,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    marginBottom: THEME.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.sm,
    borderRadius: THEME.radius.md,
    marginBottom: 2,
  },
  rowActive: {
    backgroundColor: THEME.colors.primaryLight,
  },
  rowText: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.medium,
    color: THEME.colors.text,
  },
  rowTextActive: {
    color: THEME.colors.primary,
    fontWeight: THEME.fontWeight.semibold,
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadow.md,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
  },
});
