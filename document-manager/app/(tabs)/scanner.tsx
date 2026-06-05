import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ScanPageStrip } from '@/src/components/ScanPageStrip';
import { AddPagePrompt } from '@/src/components/AddPagePrompt';
import { SaveDocumentModal } from '@/src/components/SaveDocumentModal';
import { useDocuments } from '@/src/hooks/use-documents';
import { THEME, APP_CONFIG } from '@/src/constants/config';
import { shareService, pdfService, scannerService } from '@/src/services/container';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [pages, setPages] = useState<string[]>([]);
  const [lastPageUri, setLastPageUri] = useState<string | null>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attRequested, setAttRequested] = useState(false);

  const { createDocument } = useDocuments();

  // ── Request App Tracking Transparency permission (iOS 14.5+) ──────────────

  useEffect(() => {
    const requestATT = async () => {
      if (Platform.OS !== 'ios') {
        console.log('Not iOS, skipping ATT request');
        return;
      }

      try {
        console.log('Checking ATT permission status...');
        const status = await TrackingTransparency.getTrackingPermissionsAsync();
        console.log('Current ATT status:', status.status);

        // Only request if status is undetermined
        if (status.status === 'undetermined') {
          console.log('ATT status undetermined, requesting permission...');
          const result = await TrackingTransparency.requestTrackingPermissionsAsync();
          console.log('ATT request result:', result.status);
          setAttRequested(true);
        } else {
          console.log('ATT already determined:', status.status);
        }
      } catch (error) {
        console.error('Error with ATT permission:', error);
      }
    };

    requestATT();
  }, []);

  // ── Permission guards ─────────────────────────────────────────────────────

  if (!permission) return <View style={styles.fullBlack} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Ionicons name="camera-outline" size={64} color={THEME.colors.primary} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSub}>DocVault needs the camera to scan documents.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Capture ───────────────────────────────────────────────────────────────

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;
    if (pages.length >= APP_CONFIG.maxPagesPerDocument) {
      Alert.alert('Limit reached', `Maximum ${APP_CONFIG.maxPagesPerDocument} pages per document.`);
      return;
    }
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: APP_CONFIG.imageQuality,
        base64: false,
        exif: false,
      });
      if (!photo?.uri) return;
      const processed = await scannerService.processImage(photo.uri);
      setPages((prev) => {
        const updated = [...prev, processed];
        setLastPageUri(processed);
        setShowPrompt(true);
        return updated;
      });
    } catch {
      Alert.alert('Error', 'Could not capture image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Import from gallery ───────────────────────────────────────────────────

  const handleImportFromGallery = async () => {
    const perm = await requestMediaPermission();
    if (!perm.granted) {
      Alert.alert('Permission denied', 'Media library access is required to import images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (result.canceled || result.assets.length === 0) return;

    setIsProcessing(true);
    try {
      const processed = await Promise.all(
        result.assets.map((a) => scannerService.processImage(a.uri)),
      );
      setPages((prev) => {
        const updated = [...prev, ...processed];
        setLastPageUri(processed[processed.length - 1]);
        setShowPrompt(true);
        return updated;
      });
    } catch {
      Alert.alert('Error', 'Could not process the selected images.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Save / Share ──────────────────────────────────────────────────────────

  const handleSave = async (name: string, category: string) => {
    try {
      await createDocument({ name, category, pages });
      setPages([]);
      setLastPageUri(null);
      setShowSaveModal(false);
      Alert.alert('Saved!', `"${name}" has been added to your library.`);
    } catch {
      Alert.alert('Error', 'Could not save the document.');
    }
  };

  const handleShareOnly = async (name: string, _category: string) => {
    try {
      const processedPages = await Promise.all(
        pages.map((uri) => scannerService.processImage(uri)),
      );
      const pdfUri = await pdfService.createFromImages(processedPages, name);
      await shareService.shareFile(pdfUri, name);
      setPages([]);
      setLastPageUri(null);
      setShowSaveModal(false);
    } catch {
      Alert.alert('Error', 'Could not create or share the PDF.');
    }
  };

  const clearPages = () => {
    setPages([]);
    setLastPageUri(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={cameraFacing}
        flash={flash}
      />

      {/* Top bar */}
      <View style={styles.topOverlay}>
        <SafeAreaView>
          <View style={styles.topBar}>
            <Text style={styles.topTitle}>Scan Document</Text>
            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}
              >
                <Ionicons name={flash === 'on' ? 'flash' : 'flash-off'} size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setCameraFacing((f) => (f === 'back' ? 'front' : 'back'))}
              >
                <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Viewfinder guide */}
      <View style={styles.viewfinderWrapper} pointerEvents="none">
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomOverlay}>
        <ScanPageStrip
          pages={pages}
          onRemove={(i) => setPages((p) => p.filter((_, idx) => idx !== i))}
        />

        <View style={styles.controls}>
          <TouchableOpacity style={styles.sideBtn} onPress={handleImportFromGallery} disabled={isProcessing}>
            <Ionicons name="images-outline" size={26} color="#fff" />
            <Text style={styles.sideBtnLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutter} onPress={handleCapture} disabled={isProcessing} activeOpacity={0.75}>
            {isProcessing ? (
              <ActivityIndicator color={THEME.colors.primary} size="large" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideBtn, pages.length === 0 && styles.sideBtnDisabled]}
            onPress={() => setShowSaveModal(true)}
            disabled={pages.length === 0}
          >
            <Ionicons name="document-text-outline" size={26} color="#fff" />
            <Text style={styles.sideBtnLabel}>Create PDF</Text>
          </TouchableOpacity>
        </View>

        {pages.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearPages}>
            <Ionicons name="trash-outline" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={styles.clearBtnText}>Clear all pages</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      <AddPagePrompt
        visible={showPrompt}
        lastPageUri={lastPageUri}
        pageCount={pages.length}
        onAddPage={() => setShowPrompt(false)}
        onComplete={() => { setShowPrompt(false); setShowSaveModal(true); }}
        onCancel={() => { setShowPrompt(false); clearPages(); }}
      />

      <SaveDocumentModal
        visible={showSaveModal}
        pageCount={pages.length}
        onSave={handleSave}
        onShare={handleShareOnly}
        onClose={() => setShowSaveModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fullBlack: { flex: 1, backgroundColor: '#000' },

  permissionScreen: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
    gap: THEME.spacing.md,
  },
  permTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: THEME.fontWeight.bold,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  permSub: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  permBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.radius.full,
    marginTop: THEME.spacing.md,
  },
  permBtnText: {
    color: '#fff',
    fontWeight: THEME.fontWeight.semibold,
    fontSize: THEME.fontSize.base,
  },

  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingBottom: THEME.spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
  },
  topTitle: {
    fontSize: THEME.fontSize.md,
    fontWeight: THEME.fontWeight.semibold,
    color: '#fff',
  },
  topActions: { flexDirection: 'row', gap: THEME.spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: THEME.radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewfinderWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { width: '75%', aspectRatio: 0.707, position: 'relative' },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#fff',
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: THEME.spacing.xl,
    marginTop: THEME.spacing.md,
  },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideBtnDisabled: { opacity: 0.3 },
  sideBtnLabel: {
    fontSize: THEME.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: THEME.fontWeight.medium,
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: THEME.radius.full,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: THEME.radius.full,
    backgroundColor: '#fff',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    marginTop: THEME.spacing.sm,
    padding: THEME.spacing.sm,
  },
  clearBtnText: {
    fontSize: THEME.fontSize.xs,
    color: 'rgba(255,255,255,0.55)',
  },
});
