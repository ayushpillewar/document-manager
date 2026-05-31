import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { DocumentCard } from '@/src/components/DocumentCard';
import { CategoryFilter } from '@/src/components/CategoryFilter';
import { EditCategoryModal } from '@/src/components/EditCategoryModal';
import { EmptyState } from '@/src/components/EmptyState';
import { SaveDocumentModal } from '@/src/components/SaveDocumentModal';
import { RemoveAdsButton } from '@/src/components/RemoveAdsButton';
import { useDocuments } from '@/src/hooks/use-documents';
import { Document } from '@/src/types';
import { THEME, CATEGORIES } from '@/src/constants/config';

export default function DocumentsScreen() {
  const router = useRouter();
  const {
    documents,
    displayedDocuments,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    updateCategory,
    deleteDocument,
    shareDocument,
    shareByCategory,
    importDocument,
    refresh,
  } = useDocuments();

  // Reload whenever this tab comes into focus so the list always reflects
  // documents saved on the Scanner tab (each tab has its own useDocuments instance).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedUri, setImportedUri] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // ── Category counts ───────────────────────────────────────────────────────

  const categoryCounts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = documents.filter((d) => d.category === cat).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  // ── Import from device storage ────────────────────────────────────────────

  const handlePickDocument = useCallback(async () => {
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setImportedUri(asset.uri);
      setShowImportModal(true);
    } catch {
      Alert.alert('Error', 'Could not open the file picker.');
    } finally {
      setIsImporting(false);
    }
  }, []);

  const handleImportSave = async (name: string, category: string) => {
    if (!importedUri) return;
    await importDocument(importedUri, name, category);
    setImportedUri(null);
    setShowImportModal(false);
  };

  // ── Document actions ──────────────────────────────────────────────────────

  const confirmDelete = useCallback(
    (doc: Document) => {
      Alert.alert('Delete Document', `Delete "${doc.name}"? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDocument(doc.id),
        },
      ]);
    },
    [deleteDocument],
  );

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderHeader = () => (
    <>
      {/* Remove Ads purchase banner — hidden once purchased */}
      <RemoveAdsButton />

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={THEME.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Category filter */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        counts={categoryCounts}
        onShareCategory={shareByCategory}
      />
    </>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    if (searchQuery) {
      return (
        <EmptyState
          icon="search-outline"
          title="No results"
          subtitle={`No documents match "${searchQuery}"`}
        />
      );
    }
    return (
      <EmptyState
        icon="document-text-outline"
        title="No documents yet"
        subtitle="Scan your first document using the Scanner tab, or import a PDF with the + button below."
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Documents</Text>
          <Text style={styles.headerCount}>
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.importBtn}
          onPress={handlePickDocument}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="add" size={26} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Document list */}
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedDocuments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              onPress={() => router.push(`/viewer?id=${item.id}`)}
              onShare={() => shareDocument(item)}
              onEditCategory={() => setEditingDoc(item)}
              onDelete={() => confirmDelete(item)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            displayedDocuments.length === 0 && styles.listContentGrow,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor={THEME.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit category modal */}
      {editingDoc && (
        <EditCategoryModal
          visible={!!editingDoc}
          currentCategory={editingDoc.category}
          documentName={editingDoc.name}
          onSave={(cat) => updateCategory(editingDoc.id, cat)}
          onClose={() => setEditingDoc(null)}
        />
      )}

      {/* Import save modal */}
      <SaveDocumentModal
        visible={showImportModal}
        pageCount={1}
        onSave={handleImportSave}
        onShare={async (name) => {
          // For imports we just save with the provided name
          await handleImportSave(name, CATEGORIES[0]);
        }}
        onClose={() => { setShowImportModal(false); setImportedUri(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
  },
  headerTitle: {
    fontSize: THEME.fontSize.xxl,
    fontWeight: THEME.fontWeight.extrabold,
    color: THEME.colors.text,
    letterSpacing: -0.5,
  },
  headerCount: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  importBtn: {
    width: 48,
    height: 48,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.md,
  },
  searchRow: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.full,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    ...THEME.shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: THEME.fontSize.base,
    color: THEME.colors.text,
    padding: 0,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: THEME.spacing.xxl,
  },
  listContentGrow: {
    flexGrow: 1,
  },
});
