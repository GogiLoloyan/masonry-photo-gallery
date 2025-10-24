import * as styles from './styles.css';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pexels Gallery</h1>
        <p className={styles.subtitle}>
          Discover beautiful, free photos from talented photographers
        </p>
      </header>
      <main>photos</main>
    </div>
  );
};

export default Home;
