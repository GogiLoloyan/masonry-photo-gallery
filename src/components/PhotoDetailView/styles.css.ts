import { keyframes, style } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const slideUp = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(20px)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

export const container = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${fadeIn} ${theme.transitions.fast}`,
});

export const backdrop = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.95)',
  cursor: 'pointer',
});

export const content = style({
  position: 'relative',
  zIndex: 1,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  animation: `${slideUp} ${theme.transitions.normal}`,
});

export const header = style({
  position: 'absolute',
  top: theme.spacing.lg,
  right: theme.spacing.lg,
  zIndex: 10,
  '@media': {
    '(max-width: 768px)': {
      top: theme.spacing.md,
      right: theme.spacing.md,
    },
  },
});

export const closeButton = style({
  width: theme.spacing.xxl,
  height: theme.spacing.xxl,
  borderRadius: theme.borderRadius.full,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: theme.transitions.fast,
  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    transform: 'scale(1.1)',
  },
  '@media': {
    '(max-width: 768px)': {
      width: '40px',
      height: '40px',
    },
  },
});

export const imageContainer = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: `${theme.spacing.xxl} ${theme.spacing.lg}`,
  cursor: 'pointer',
  '@media': {
    '(max-width: 768px)': {
      padding: `${theme.spacing.xl} ${theme.spacing.md}`,
    },
  },
});

export const placeholder = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.borderRadius.lg,
  maxWidth: '90vw',
  maxHeight: '70vh',
});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const spinner = style({
  width: theme.spacing.xxl,
  height: theme.spacing.xxl,
  border: '3px solid rgba(255, 255, 255, 0.1)',
  borderTopColor: 'white',
  borderRadius: theme.borderRadius.full,
  animation: `${spin} 0.8s linear infinite`,
});

export const image = style({
  maxWidth: '90vw',
  maxHeight: '70vh',
  objectFit: 'contain',
  borderRadius: theme.borderRadius.lg,
  transition: `opacity ${theme.transitions.normal}`,
  userSelect: 'none',
});

export const info = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
  padding: theme.spacing.xl,
  paddingTop: '100px',
  pointerEvents: 'none',
  '@media': {
    '(max-width: 768px)': {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.xxl,
    },
  },
});

export const infoContent = style({
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.md,
  color: 'white',
  pointerEvents: 'auto',
});

export const photographerInfo = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing.md,
  flexWrap: 'wrap',
});

export const photographerName = style({
  fontSize: theme.fontSize.xl,
  fontWeight: theme.fontWeight.semibold,
  margin: 0,
  '@media': {
    '(max-width: 768px)': {
      fontSize: theme.fontSize.lg,
    },
  },
});

export const photographerLink = style({
  color: '#60a5fa',
  textDecoration: 'none',
  fontSize: theme.fontSize.sm,
  transition: theme.transitions.fast,
  ':hover': {
    textDecoration: 'underline',
    color: '#93c5fd',
  },
});

export const description = style({
  fontSize: theme.fontSize.base,
  opacity: 0.9,
  maxWidth: '800px',
  margin: 0,
  lineHeight: 1.6,
  '@media': {
    '(max-width: 768px)': {
      fontSize: theme.fontSize.sm,
    },
  },
});

export const metadata = style({
  display: 'flex',
  gap: theme.spacing.xl,
  flexWrap: 'wrap',
  fontSize: theme.fontSize.sm,
  opacity: 0.8,
  '@media': {
    '(max-width: 768px)': {
      gap: theme.spacing.md,
      fontSize: theme.fontSize.xs,
    },
  },
});

export const metaItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xs,
});

export const metaLabel = style({
  opacity: 0.7,
  fontWeight: theme.fontWeight.medium,
});

export const actions = style({
  display: 'flex',
  gap: theme.spacing.md,
  marginTop: theme.spacing.sm,
});

export const downloadButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing.sm,
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.borderRadius.md,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.medium,
  textDecoration: 'none',
  transition: theme.transitions.fast,
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
  },
  '@media': {
    '(max-width: 768px)': {
      fontSize: theme.fontSize.xs,
      padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    },
  },
});
