import {
  IAuthProvider,
  IAuthSetupProvider,
  AuthResult,
  IStorageService,
  ISecureStorageService,
} from '../types';
import { STORAGE_KEYS, SECURE_STORAGE_KEYS } from '../constants/config';

/**
 * 4-digit passcode auth provider.
 * Depends on IStorageService + ISecureStorageService (injected) — DIP.
 */
export class PasscodeService implements IAuthProvider, IAuthSetupProvider {
  constructor(
    private readonly storage: IStorageService,
    private readonly secureStorage: ISecureStorageService,
  ) {}

  async isAvailable(): Promise<boolean> {
    return true; // always available as a fallback
  }

  async isSetUp(): Promise<boolean> {
    const method = await this.storage.get<string>(STORAGE_KEYS.authMethod);
    return method === 'passcode';
  }

  async authenticate(passcode?: string): Promise<AuthResult> {
    if (!passcode) return { success: false, error: 'No passcode provided' };
    const stored = await this.secureStorage.getSecure(SECURE_STORAGE_KEYS.passcode);
    const success = stored === passcode;
    return {
      success,
      error: success ? undefined : 'Incorrect passcode. Please try again.',
    };
  }

  async setup(passcode?: string): Promise<void> {
    if (!passcode) throw new Error('A passcode is required');
    await this.secureStorage.setSecure(SECURE_STORAGE_KEYS.passcode, passcode);
    await this.storage.set(STORAGE_KEYS.authMethod, 'passcode');
    await this.storage.set(STORAGE_KEYS.authSetup, true);
  }

  async reset(): Promise<void> {
    await this.secureStorage.deleteSecure(SECURE_STORAGE_KEYS.passcode);
    await this.storage.remove(STORAGE_KEYS.authMethod);
    await this.storage.remove(STORAGE_KEYS.authSetup);
  }
}
