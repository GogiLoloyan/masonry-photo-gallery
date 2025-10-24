import { style } from '@vanilla-extract/css';

import { mobile } from '../../styles/responsive';
import { theme } from '../../styles/theme.css';

export const container = style({
  minHeight: '100vh',
  backgroundColor: theme.colors.background,
});

export const header = style({
  textAlign: 'center',
  padding: `${theme.spacing.xxl} ${theme.spacing.lg}`,
  backgroundColor: theme.colors.surface,
  borderBottom: `1px solid ${theme.colors.border}`,
});

export const title = style({
  fontSize: theme.fontSize.xxxl,
  fontWeight: theme.fontWeight.bold,
  color: theme.colors.text,
  margin: `0 0 ${theme.spacing.sm} 0`,
  ...mobile({
    fontSize: theme.fontSize.xxl,
  }),
});

export const subtitle = style({
  fontSize: theme.fontSize.lg,
  color: theme.colors.textSecondary,
  margin: `0 0 ${theme.spacing.xl} 0`,
  ...mobile({
    fontSize: theme.fontSize.base,
  }),
});
