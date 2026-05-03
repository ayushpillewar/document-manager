import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { IPDFService } from '../types';

const DOCUMENTS_DIR = `${FileSystem.documentDirectory}docvault/pdfs/`;

/** Creates PDF files from arrays of image URIs using expo-print. */
export class PDFService implements IPDFService {
  async createFromImages(imageUris: string[], documentName: string): Promise<string> {
    // Read each image as base64 and embed it in a full-page HTML layout
    const pageHtml = await Promise.all(
      imageUris.map(async (uri) => {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64' as FileSystem.EncodingType,
        });
        return `<div class="page"><img src="data:image/jpeg;base64,${base64}" /></div>`;
      }),
    );

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#fff}
    @page{margin:0;size:A4}
    .page{
      page-break-after:always;
      width:100%;height:100vh;
      display:flex;align-items:center;justify-content:center;
      background:#fff
    }
    .page img{max-width:100%;max-height:100vh;object-fit:contain}
  </style>
</head>
<body>${pageHtml.join('')}</body>
</html>`;

    const { uri: tmpUri } = await Print.printToFileAsync({ html, base64: false });

    await FileSystem.makeDirectoryAsync(DOCUMENTS_DIR, { intermediates: true });
    const safeName = documentName.replace(/[^a-z0-9]/gi, '_');
    const destUri = `${DOCUMENTS_DIR}${safeName}_${Date.now()}.pdf`;
    await FileSystem.moveAsync({ from: tmpUri, to: destUri });

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
