import * as LocalAuthentication from 'expo-local-authentication';
import {
  IAuthProvider,
  IAuthSetupProvider,
  AuthResult,
  IStorageService,
} from '../types';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Biometric auth provider.
 * Depends on IStorageService (injected) — Dependency Inversion Principle.
 */
export class BiometricService implements IAuthProvider, IAuthSetupProvider {
  constructor(private readonly storage: IStorageService) {}

  async isAvailable(): Promise<boolean> {
    const [compatible, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return compatible && enrolled;
  }

  async isSetUp(): Promise<boolean> {
    const method = await this.storage.get<string>(STORAGE_KEYS.authMethod);
    return method === 'biometric';
  }

  async authenticate(): Promise<AuthResult> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access DocVault',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return {
      success: result.success,
      error: result.success ? undefined : 'Authentication failed',
    };
  }

  async setup(): Promise<void> {
    await this.storage.set(STORAGE_KEYS.authMethod, 'biometric');
    await this.storage.set(STORAGE_KEYS.authSetup, true);
  }

  async reset(): Promise<void> {
    await this.storage.remove(STORAGE_KEYS.authMethod);
    await this.storage.remove(STORAGE_KEYS.authSetup);
  }
}
