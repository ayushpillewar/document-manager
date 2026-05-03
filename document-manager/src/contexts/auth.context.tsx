import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AuthMethod, AuthState } from '../types';
import {
  storageService,
  biometricService,
  passcodeService,
} from '../services/container';
import { STORAGE_KEYS } from '../constants/config';

interface AuthContextValue extends AuthState {
  setupBiometric: () => Promise<void>;
  setupPasscode: (passcode: string) => Promise<void>;
  /** Pass a passcode string only when authMethod === 'passcode'. */
  authenticate: (credential?: string) => Promise<boolean>;
  lock: () => void;
  isBiometricAvailable: () => Promise<boolean>;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    authMethod: 'none',
    isSetUp: false,
    isLoading: true,
  });

  const reload = useCallback(async () => {
    const method = await storageService.get<AuthMethod>(STORAGE_KEYS.authMethod);
    const isSetUp = await storageService.get<boolean>(STORAGE_KEYS.authSetup);
    setState((prev) => ({
      ...prev,
      authMethod: method ?? 'none',
      isSetUp: !!isSetUp,
      isLoading: false,
    }));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const setupBiometric = useCallback(async () => {
    await biometricService.setup();
    await reload();
  }, [reload]);

  const setupPasscode = useCallback(
    async (passcode: string) => {
      await passcodeService.setup(passcode);
      await reload();
    },
    [reload],
  );

  const authenticate = useCallback(async (credential?: string): Promise<boolean> => {
    const method = await storageService.get<AuthMethod>(STORAGE_KEYS.authMethod);
    let result;
    if (method === 'biometric') {
      result = await biometricService.authenticate();
    } else if (method === 'passcode') {
      result = await passcodeService.authenticate(credential);
    } else {
      result = { success: true };
    }
    if (result.success) {
      setState((prev) => ({ ...prev, isAuthenticated: true }));
    }
    return result.success;
  }, []);

  const lock = useCallback(() => {
    setState((prev) => ({ ...prev, isAuthenticated: false }));
  }, []);

  const isBiometricAvailable = useCallback(async () => {
    return biometricService.isAvailable();
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, setupBiometric, setupPasscode, authenticate, lock, isBiometricAvailable, reload }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>');
  return ctx;
}
