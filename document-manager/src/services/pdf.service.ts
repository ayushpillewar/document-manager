// eslint-disable-next-line @typescript-eslint/no-require-imports
const RNImageToPdf = require('react-native-image-to-pdf').default as {
  createPDFbyImages(options: {
    imagePaths: string[];
    name: string;
    quality?: number;
    maxSize?: { width: number; height: number };
  }): Promise<{ filePath: string }>;
};

import * as FileSystem from 'expo-file-system/legacy';
import { IPDFService } from '../types';

const DOCUMENTS_DIR = `${FileSystem.documentDirectory}docvault/pdfs/`;

/** Creates PDF files from arrays of image URIs using react-native-image-to-pdf. */
export class PDFService implements IPDFService {
  async createFromImages(imageUris: string[], documentName: string): Promise<string> {
    // The native module expects plain file-system paths without the file:// scheme.
    const imagePaths = imageUris.map((uri) =>
      uri.startsWith('file://') ? decodeURIComponent(uri.slice(7)) : uri,
    );

    const safeName = documentName.replace(/[^a-z0-9]/gi, '_');
    const pdfName = `${safeName}_${Date.now()}`;

    const result = await RNImageToPdf.createPDFbyImages({
      imagePaths,
      name: pdfName,
      quality: 0.9,
    });

    await FileSystem.makeDirectoryAsync(DOCUMENTS_DIR, { intermediates: true });
    const destUri = `${DOCUMENTS_DIR}${pdfName}.pdf`;

    const srcUri = result.filePath.startsWith('file://')
      ? result.filePath
      : `file://${result.filePath}`;
    await FileSystem.moveAsync({ from: srcUri, to: destUri });

    return destUri;
  }

  async getFileSizeKB(fileUri: string): Promise<number> {
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      if (!info.exists) return 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Math.round(((info as any).size ?? 0) / 1024);
    } catch {
      return 0;
    }
  }
}
