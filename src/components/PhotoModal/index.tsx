import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/RootStore';
import PhotoDetailView from '../PhotoDetailView';

const PhotoModal = () => {
  const { uiStore, photoStore } = useStores();

  if (!uiStore.hasOpenModal || !photoStore.currentPhoto) return null;

  return (
    <PhotoDetailView photo={photoStore.currentPhoto} onClose={() => uiStore.closePhotoModal()} />
  );
};

export default observer(PhotoModal);
