import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { documentRepository } from '@/src/services/container';
import { Document } from '@/src/types';
import { THEME } from '@/src/constants/config';

export default function ViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  // base64-encoded PDF content loaded from the sandbox-accessible file path
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset all state immediately so the old PDF never shows while loading the new one
    setDocument(null);
    setPdfBase64(null);
    setError(null);
    setLoading(true);

    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const doc = await documentRepository.getById(id);
        if (!doc) { setError('Document not found.'); return; }
        setDocument(doc);
        // Read file as base64 so we can embed it as a data: URI, bypassing
        // the iOS WKWebView sandbox restriction on file:// URIs.
        const b64 = await FileSystem.readAsStringAsync(doc.pdfUri, {
          encoding: 'base64' as FileSystem.EncodingType,
        });
        setPdfBase64(b64);
      } catch {
        setError('Failed to load document.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {document?.name ?? 'Document'}
        </Text>
        <View style={styles.backBtn} pointerEvents="none" />
      </View>

      {/* Content */}
      {loading && (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centre}>
          <Ionicons name="alert-circle-outline" size={48} color={THEME.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && document && pdfBase64 && (
        <WebView
          key={id}
          style={styles.webview}
          // Embedding via source.html avoids iOS URL-length limits that crash
          // when the base64 string is passed directly as a data: URI.
          source={{
            html: `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;background:#1a1a1a}embed{display:block;width:100%;height:100%}</style>
</head><body><embed src="data:application/pdf;base64,${pdfBase64}" type="application/pdf" width="100%" height="100%"/></body></html>`,
          }}
          originWhitelist={['*']}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.centre}>
              <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
          )}
          onError={() => setError('Could not render the PDF.')}
          bounces={false}
        />
      )}
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
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.semibold,
    color: THEME.colors.text,
  },
  webview: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centre: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
  },
  errorText: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
  },
});
