import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, CATEGORIES } from '../constants/config';
import { useIAPContext } from '../contexts/iap.context';
import { useInterstitialAd } from './AdMob';

interface Props {
  visible: boolean;
  pageCount: number;
  onSave: (name: string, category: string) => Promise<void>;
  onShare: (name: string, category: string) => Promise<void>;
  onClose: () => void;
}

export function SaveDocumentModal({ visible, pageCount, onSave, onShare, onClose }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const { isAdFree } = useIAPContext();
  const { showAd } = useInterstitialAd(isAdFree);

  const validate = () => {
    if (!name.trim()) {
      setNameError('Please enter a document name');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(name.trim(), category);
      setName('');
      setCategory(CATEGORIES[0]);
      showAd();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onShare(name.trim(), category);
      setName('');
      setCategory(CATEGORIES[0]);
      showAd();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetWrapper}
        >
          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Save Document</Text>
                <Text style={styles.subtitle}>{pageCount} page{pageCount > 1 ? 's' : ''} scanned</Text>
              </View>
              <TouchableOpacity onPress={onClose} disabled={loading} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Name input */}
            <Text style={styles.fieldLabel}>Document Name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="e.g. Passport Scan"
              placeholderTextColor={THEME.colors.textMuted}
              value={name}
              onChangeText={(t) => { setName(t); setNameError(''); }}
              autoFocus
              returnKeyType="done"
              maxLength={80}
            />
            {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

            {/* Category selector */}
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              <View style={styles.catRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, category === cat && styles.catChipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={handleShare}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={THEME.colors.primary} size="small" />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={18} color={THEME.colors.primary} />
                    <Text style={[styles.btnText, styles.btnTextSecondary]}>Share Only</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#fff" />
                    <Text style={[styles.btnText, styles.btnTextPrimary]}>Save to Library</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.radius.xl,
    borderTopRightRadius: THEME.radius.xl,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
    paddingTop: THEME.spacing.sm,
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
    marginBottom: THEME.spacing.lg,
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
  },
  closeBtn: {
    padding: 4,
  },
  fieldLabel: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 2,
    fontSize: THEME.fontSize.base,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
    marginBottom: THEME.spacing.md,
  },
  inputError: {
    borderColor: THEME.colors.danger,
  },
  error: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.danger,
    marginTop: -THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  catScroll: {
    marginBottom: THEME.spacing.lg,
  },
  catRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    paddingVertical: 4,
  },
  catChip: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm - 2,
    borderRadius: THEME.radius.full,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  catChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  catChipText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.textSecondary,
  },
  catChipTextActive: {
    color: THEME.colors.primary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm - 2,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.radius.md,
  },
  btnPrimary: {
    backgroundColor: THEME.colors.primary,
    ...THEME.shadow.md,
  },
  btnSecondary: {
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: THEME.fontSize.base,
    fontWeight: THEME.fontWeight.semibold,
  },
  btnTextPrimary: {
    color: '#fff',
  },
  btnTextSecondary: {
    color: THEME.colors.primary,
  },
});
