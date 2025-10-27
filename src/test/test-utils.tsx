import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { StoreProvider } from '@/stores/RootStore';

interface AllTheProvidersProps {
  children: ReactNode;
}

export function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <StoreProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </StoreProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
