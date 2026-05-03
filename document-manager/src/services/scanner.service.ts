import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { IScannerService } from '../types';
import { APP_CONFIG } from '../constants/config';

const PAGES_DIR = `${FileSystem.documentDirectory}docvault/pages/`;

/** Processes and persists a scanned page image. */
export class ScannerService implements IScannerService {
  async processImage(uri: string, quality = APP_CONFIG.imageQuality): Promise<string> {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: APP_CONFIG.pdfPageWidth, height: APP_CONFIG.pdfPageHeight } }], // normalise to A4 page dimensions
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
    );

    await FileSystem.makeDirectoryAsync(PAGES_DIR, { intermediates: true });
    const destUri = `${PAGES_DIR}page_${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: result.uri, to: destUri });
    return destUri;
  }
}

