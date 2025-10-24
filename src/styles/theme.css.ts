import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';

export const theme = createGlobalTheme(':root', {
  colors: {
    background: '#ffffff',
    backgroundDark: '#121212',
    surface: '#f5f5f5',
    surfaceDark: '#1e1e1e',
    primary: '#2563eb',
    primaryDark: '#3b82f6',
    text: '#1a1a1a',
    textDark: '#e5e5e5',
    textSecondary: '#6b7280',
    textSecondaryDark: '#9ca3af',
    border: '#e5e7eb',
    borderDark: '#374151',
    error: '#ef4444',
    success: '#10b981',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
});

// Global styles
globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

globalStyle('html, body', {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: theme.fontSize.base,
  lineHeight: 1.5,
  color: theme.colors.text,
  backgroundColor: theme.colors.background,
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
});

globalStyle('img', {
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
});

globalStyle('button', {
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  font: 'inherit',
});

// Dark mode support
globalStyle(':root', {
  '@media': {
    '(prefers-color-scheme: dark)': {
      colorScheme: 'dark',
    },
  },
});

globalStyle('body', {
  '@media': {
    '(prefers-color-scheme: dark)': {
      color: theme.colors.textDark,
      backgroundColor: theme.colors.backgroundDark,
    },
  },
});
