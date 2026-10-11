import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    primaryForeground: '#FFFFFF',
    text: '#09090B',
    textSecondary: '#71717A',
    textMuted: '#A1A1AA',
    background: '#FAFAFA',
    card: '#FFFFFF',
    backgroundElement: '#F4F4F5',
    backgroundSelected: '#E4E4E7',
    border: '#E4E4E7',
    destructive: '#DC2626',
    destructiveLight: '#FEE2E2',
    warning: '#D97706',
    success: '#16A34A',
    successLight: '#DCFCE7',
    badgeNote: '#EFF6FF',
    badgeNoteText: '#1D4ED8',
    badgeLink: '#F0FDF4',
    badgeLinkText: '#15803D',
    badgeImage: '#FAF5FF',
    badgeImageText: '#7E22CE',
  },
  dark: {
    primary: '#3B82F6',
    primaryPressed: '#60A5FA',
    primaryForeground: '#FFFFFF',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    background: '#09090B',
    card: '#18181B',
    backgroundElement: '#27272A',
    backgroundSelected: '#3F3F46',
    border: '#27272A',
    destructive: '#EF4444',
    destructiveLight: '#450A0A',
    warning: '#F59E0B',
    success: '#22C55E',
    successLight: '#052E16',
    badgeNote: '#1E293B',
    badgeNoteText: '#93C5FD',
    badgeLink: '#143321',
    badgeLinkText: '#86EFAC',
    badgeImage: '#2E1065',
    badgeImageText: '#D8B4FE',
  },
} as const;

export type ThemeColors = (typeof Colors)[keyof typeof Colors];
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Typography = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const Spacing = {
  quarter: 2,
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const TouchTarget = {
  min: 48,
  buttonHeight: 48,
  inputHeight: 48,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
