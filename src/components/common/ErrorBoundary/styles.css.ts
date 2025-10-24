import { style } from '@vanilla-extract/css';

import { theme } from '../../../styles/theme.css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing.lg,
  backgroundColor: theme.colors.background,
});

export const content = style({
  textAlign: 'center',
  maxWidth: '500px',
  padding: theme.spacing.xl,
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.lg,
  boxShadow: theme.shadows.lg,
});

export const title = style({
  fontSize: theme.fontSize.xxl,
  fontWeight: theme.fontWeight.bold,
  color: theme.colors.text,
  marginBottom: theme.spacing.md,
});

export const message = style({
  fontSize: theme.fontSize.base,
  color: theme.colors.textSecondary,
  marginBottom: theme.spacing.xl,
});

export const resetButton = style({
  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
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
