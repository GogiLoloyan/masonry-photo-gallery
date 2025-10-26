import { style } from '@vanilla-extract/css';

import { theme } from '../../styles/theme.css';

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
