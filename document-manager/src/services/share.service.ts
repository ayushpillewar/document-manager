import * as Sharing from 'expo-sharing';
import { IShareService } from '../types';

/** Wraps expo-sharing behind the IShareService interface. */
export class ShareService implements IShareService {
  async isAvailable(): Promise<boolean> {
    return Sharing.isAvailableAsync();
  }

  async shareFile(uri: string, title?: string): Promise<void> {
    const available = await this.isAvailable();
    if (!available) throw new Error('Sharing is not available on this device');

    const isZip = uri.endsWith('.zip');
    await Sharing.shareAsync(uri, {
      dialogTitle: title ?? 'Share Document',
      UTI: isZip ? 'public.zip-archive' : 'com.adobe.pdf',
      mimeType: isZip ? 'application/zip' : 'application/pdf',
    });
  }
}
