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
    await Sharing.shareAsync(uri, {
      dialogTitle: title ?? 'Share Document',
      UTI: 'com.adobe.pdf',
      mimeType: 'application/pdf',
    });
  }
}
