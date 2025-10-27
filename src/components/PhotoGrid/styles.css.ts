import { keyframes, style } from '@vanilla-extract/css';

import { theme } from '../../styles/theme.css';

export const scrollContainer = style({
  position: 'relative',
  width: '100%',
  height: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '1rem',
});

export const gridContainer = style({
  position: 'relative',
  width: '100%',
  margin: '0 auto',
  minHeight: '100vh',
});

export const error = style({
  textAlign: 'center',
  padding: theme.spacing.xl,
  color: theme.colors.error,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing.md,
});

export const retryButton = style({
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  backgroundColor: theme.colors.primary,
  color: 'white',
  border: 'none',
  borderRadius: theme.borderRadius.md,
  fontSize: theme.fontSize.base,
  fontWeight: theme.fontWeight.medium,
  cursor: 'pointer',
  transition: theme.transitions.fast,
  ':hover': {
    backgroundColor: theme.colors.primaryDark,
    transform: 'translateY(-2px)',
  },
});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const loadingIndicator = style({
  position: 'fixed',
  bottom: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 1.5rem',
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.lg,
  boxShadow: theme.shadows.lg,
  zIndex: 100,
});

export const spinner = style({
  width: '1.5rem',
  height: '1.5rem',
  border: `2px solid ${theme.colors.border}`,
  borderTopColor: theme.colors.primary,
  borderRadius: '50%',
  animation: `${spin} 0.6s linear infinite`,
});
