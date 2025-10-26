import { createContext, useContext } from 'react';

import { PhotoStore } from './Photostore';
import { SearchStore } from './Searchstore';
import { UIStore } from './Uistore';

export class RootStore {
  photoStore: PhotoStore;
  uiStore: UIStore;
  searchStore: SearchStore;

  constructor() {
    this.photoStore = new PhotoStore(this);
    this.uiStore = new UIStore(this);
    this.searchStore = new SearchStore(this);
  }

  reset() {
    this.photoStore.reset();
    this.uiStore.reset();
    this.searchStore.reset();
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
