import type { StyleRule } from '@vanilla-extract/css';

import { BREAKPOINTS } from '../constants/config';

type Breakpoint = keyof typeof BREAKPOINTS;

// desktop first approach
export const breakpoint = (
  maxBreakpoint: Breakpoint,
  rule: StyleRule
): { [key: string]: StyleRule } => {
  const maxWidth = BREAKPOINTS[maxBreakpoint];
  return {
    [`@media screen and (max-width: ${maxWidth - 1}px)`]: rule,
  };
};

// desktop and down
export const desktop = (rule: StyleRule) => breakpoint('desktop', rule);
// tablet and down
export const tablet = (rule: StyleRule) => breakpoint('tablet', rule);
// mobile only
export const mobile = (rule: StyleRule) => breakpoint('mobile', rule);
