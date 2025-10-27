import { observer } from 'mobx-react-lite';
import { useRef } from 'react';

import { useStores } from '../../stores/RootStore';
import * as styles from './styles.css';

const SearchBar = () => {
  const { searchStore, photoStore } = useStores();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchStore.setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchStore.executeSearch();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    searchStore.clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        {/* Search Icon */}
        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19 19L14.65 14.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={searchStore.searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for photos..."
          className={styles.input}
          aria-label="Search photos"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Clear button or loading indicator */}
        {searchStore.searchQuery && (
          <button
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear search"
            type="button"
          >
            {searchStore.isSearching ? (
              <div className={styles.loadingSpinner} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {photoStore.totalResults > 0 && searchStore.hasActiveSearch && !searchStore.isSearching && (
        <div className={styles.stats}>
          Found {photoStore.totalResults} results for "{searchStore.searchQuery}"
        </div>
      )}
    </div>
  );
};

export default observer(SearchBar);
