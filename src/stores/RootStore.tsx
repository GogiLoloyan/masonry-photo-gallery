import { createContext, useContext } from 'react';

import { PhotoStore } from './Photostore';
import { UIStore } from './Uistore';

export class RootStore {
  photoStore: PhotoStore;
  uiStore: UIStore;

  constructor() {
    this.photoStore = new PhotoStore(this);
    this.uiStore = new UIStore(this);
  }

  reset() {
    this.photoStore.reset();
    this.uiStore.reset();
  }
}

export const rootStore = new RootStore();

const StoreContext = createContext<RootStore>(rootStore);

export const useStores = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return store;
};

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
};
