/**
 * Single source of truth for all application configuration.
 * Update values here to change behaviour across the entire app.
 */

// ── Application metadata ────────────────────────────────────────────────────
export const APP_CONFIG = {
  name: 'DocVault',
  version: '1.0.0',
  /** Apple Standard EULA – used on the splash screen */
  termsUrl: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  /**
   * Update this URL after pushing privacy-policy.txt to your GitHub repo.
   * e.g. 'https://raw.githubusercontent.com/YOUR_USERNAME/document-manager/main/privacy-policy.txt'
   */
  privacyPolicyUrl: 'https://placeholder.invalid/privacy-policy.txt',
  /**
   * Splash background image.
   * Place your image at: assets/images/splash-bg.png
   * Then set useSplashBgImage to true.
   */
  useSplashBgImage: false,
  // Scanner
  imageQuality: 0.85,
  maxPagesPerDocument: 50,
  // Auth
  passcodeLength: 4,
  maxPasscodeAttempts: 5,
} as const;

// ── Document categories ─────────────────────────────────────────────────────
export const CATEGORIES = [
  'Personal',
  'Work',
  'Finance',
  'Medical',
  'Legal',
  'Education',
  'Travel',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

// ── AsyncStorage keys ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  documents: '@docvault:documents',
  authSetup: '@docvault:auth_setup',
  authMethod: '@docvault:auth_method',
  splashAccepted: '@docvault:splash_accepted',
} as const;

// ── SecureStore keys ────────────────────────────────────────────────────────
export const SECURE_STORAGE_KEYS = {
  passcode: 'docvault_passcode',
} as const;

// ── Design system ───────────────────────────────────────────────────────────
export const THEME = {
  colors: {
    // Brand
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    primaryDark: '#1D4ED8',
    secondary: '#7C3AED',
    secondaryLight: '#F5F3FF',
    accent: '#059669',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    success: '#16A34A',
    successLight: '#F0FDF4',
    // Light mode surfaces
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    divider: '#F1F5F9',
    overlay: 'rgba(15, 23, 42, 0.6)',
    // Dark mode surfaces
    backgroundDark: '#0F172A',
    surfaceDark: '#1E293B',
    surfaceElevatedDark: '#273549',
    textDark: '#F1F5F9',
    textSecondaryDark: '#94A3B8',
    textMutedDark: '#475569',
    borderDark: '#334155',
    dividerDark: '#1E293B',
    // Category badge colors
    categoryColors: {
      Personal: { bg: '#EFF6FF', text: '#1D4ED8' },
      Work: { bg: '#F0FDF4', text: '#15803D' },
      Finance: { bg: '#FFF7ED', text: '#C2410C' },
      Medical: { bg: '#FFF1F2', text: '#BE123C' },
      Legal: { bg: '#F5F3FF', text: '#6D28D9' },
      Education: { bg: '#ECFDF5', text: '#065F46' },
      Travel: { bg: '#F0F9FF', text: '#0369A1' },
      Other: { bg: '#F8FAFC', text: '#475569' },
    } as Record<string, { bg: string; text: string }>,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    xxxl: 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

// ── Splash gradient (used until a real bg image is provided) ────────────────
export const SPLASH_GRADIENT = ['#0F172A', '#1E3A5F', '#1D4ED8'] as const;
