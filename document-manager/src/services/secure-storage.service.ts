import * as SecureStore from 'expo-secure-store';
import { ISecureStorageService } from '../types';

/** expo-secure-store backed implementation of ISecureStorageService. */
export class SecureStorageService implements ISecureStorageService {
  async getSecure(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  }

  async setSecure(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async deleteSecure(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}
