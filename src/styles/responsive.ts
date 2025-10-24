import type { StyleRule } from '@vanilla-extract/css';

import { BREAKPOINTS } from '../constants/config';

type Breakpoint = keyof typeof BREAKPOINTS;

export const breakpoint = (
  minBreakpoint: Breakpoint,
  rule: StyleRule
): { [key: string]: StyleRule } => {
  const minWidth = BREAKPOINTS[minBreakpoint];
  return {
    [`@media screen and (min-width: ${minWidth}px)`]: rule,
  };
};

export const mobile = (rule: StyleRule) => breakpoint('mobile', rule);
export const tablet = (rule: StyleRule) => breakpoint('tablet', rule);
export const desktop = (rule: StyleRule) => breakpoint('desktop', rule);
export const largeDesktop = (rule: StyleRule) => breakpoint('largeDesktop', rule);
