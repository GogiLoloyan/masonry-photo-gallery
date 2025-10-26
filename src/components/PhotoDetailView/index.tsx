import type { PhotoDetails } from '../../types/app';
import * as styles from './styles.css';

interface PhotoDetailViewProps {
  photo: PhotoDetails;
  onClose: () => void;
}

const PhotoDetailView = ({ photo, onClose }: PhotoDetailViewProps) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.container} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={handleBackdropClick} />

      <div className={styles.content}>
        {/* Photo header */}
        <header className={styles.header}>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {/* Photo */}
        <div className={styles.imageContainer} onClick={handleBackdropClick}>
          <img
            src={photo.src.original}
            alt={photo.alt || `Photo by ${photo.photographer}`}
            className={styles.image}
          />
        </div>

        {/* Photo information */}
        <div className={styles.info}>
          <div className={styles.infoContent}>
            <div className={styles.photographerInfo}>
              <h2 className={styles.photographerName}>Photo by {photo.photographer}</h2>
              {photo.photographerUrl && (
                <a
                  href={photo.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.photographerLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  View Profile →
                </a>
              )}
            </div>

            {photo.alt && <p className={styles.description}>{photo.alt}</p>}

            <div className={styles.metadata}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Dimensions:</span>
                <span>
                  {photo.width} × {photo.height}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Aspect Ratio:</span>
                <span>{photo.aspectRatio}</span>
              </div>
              {photo.avgColor && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Avg Color:</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: photo.avgColor,
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    />
                    {photo.avgColor}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailView;
