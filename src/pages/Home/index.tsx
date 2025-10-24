import { SearchBar } from '../../components/common/SearchBar';
import * as styles from './styles.css';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pexels Gallery</h1>
        <p className={styles.subtitle}>
          Discover beautiful, free photos from talented photographers
        </p>
        <SearchBar
          value=""
          onChange={() => {}}
          onClear={() => {}}
          placeholder="Search for photos..."
        />
      </header>

      {/* Error case */}
      {/* Photos */}
      {/* No Photos */}
      {/* Loading */}

      {/* Photo detaild view modal */}
    </div>
  );
};

export default Home;
