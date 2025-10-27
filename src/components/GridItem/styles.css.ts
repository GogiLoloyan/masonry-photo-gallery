import { keyframes, style } from '@vanilla-extract/css';

import { theme } from '@/styles/theme.css';

export const gridItem = style({
  position: 'absolute',
  cursor: 'pointer',
  borderRadius: theme.borderRadius.md,
  overflow: 'hidden',
  backgroundColor: theme.colors.surface,
  transition: `transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast}`,
  ':hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows.xl,
    zIndex: 10,
  },
  ':focus': {
    outline: `2px solid ${theme.colors.primary}`,
    outlineOffset: theme.spacing.xs,
  },
  selectors: {
    '&:focus:not(:focus-visible)': {
      outline: 'none',
    },
  },
});

export const placeholder = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

const shimmer = keyframes({
  '0%': {
    transform: 'translateX(-100%)',
  },
  '100%': {
    transform: 'translateX(100%)',
  },
});

export const shimmerEffect = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: `linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  )`,
  animation: `${shimmer} 1.5s infinite`,
  transition: `opacity ${theme.transitions.normal}`,
});

export const image = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: `opacity ${theme.transitions.normal}`,
});

export const overlay = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
  color: 'white',
  padding: `${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.md}`,
  transform: 'translateY(100%)',
  transition: `transform ${theme.transitions.normal}`,
  selectors: {
    [`${gridItem}:hover &`]: {
      transform: 'translateY(0)',
    },
  },
});

export const overlayContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xs,
});

export const photographer = style({
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.semibold,
  margin: 0,
});

export const description = style({
  fontSize: theme.fontSize.xs,
  opacity: 0.9,
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
