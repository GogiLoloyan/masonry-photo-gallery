import { keyframes, style } from '@vanilla-extract/css';

import { theme } from '../../styles/theme.css';

export const container = style({
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
});

export const inputWrapper = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

export const searchIcon = style({
  position: 'absolute',
  left: theme.spacing.md,
  color: theme.colors.textSecondary,
  pointerEvents: 'none',
});

export const input = style({
  width: '100%',
  padding: `${theme.spacing.md} ${theme.spacing.xxl} ${theme.spacing.md} ${theme.spacing.xxl}`,
  fontSize: theme.fontSize.base,
  color: theme.colors.text,
  border: `2px solid ${theme.colors.border}`,
  borderRadius: theme.borderRadius.full,
  backgroundColor: theme.colors.background,
  transition: theme.transitions.fast,
  ':focus': {
    outline: 'none',
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 3px ${theme.colors.primary}20`,
  },
  '::placeholder': {
    color: theme.colors.textSecondary,
  },
});

export const clearButton = style({
  position: 'absolute',
  right: theme.spacing.md,
  padding: theme.spacing.sm,
  backgroundColor: 'transparent',
  border: 'none',
  color: theme.colors.textSecondary,
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: theme.transitions.fast,
  ':hover': {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  ':disabled': {
    cursor: 'default',
    opacity: 0.5,
  },
});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const loadingSpinner = style({
  width: '16px',
  height: '16px',
  border: `2px solid ${theme.colors.border}`,
  borderTopColor: theme.colors.primary,
  borderRadius: '50%',
  animation: `${spin} 0.6s linear infinite`,
});

export const stats = style({
  textAlign: 'center',
  padding: theme.spacing.sm,
  color: theme.colors.text,
  fontSize: theme.fontSize.base,
});
