import { action, computed, makeObservable, observable, reaction } from 'mobx';
import type { RootStore } from './RootStore';

export class UIStore {
  rootStore: RootStore;

  // --- Modal state
  isPhotoModalOpen = false;
  selectedPhotoId: number | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeObservable(this, {
      // --- Observable state
      isPhotoModalOpen: observable,
      selectedPhotoId: observable,

      // --- Computed values
      hasOpenModal: computed,
      currentPhotoId: computed,

      // -- Actions
      openPhotoModal: action,
      closePhotoModal: action,
      reset: action,
    });

    // --- Initialize reactions
    this.setupModalReactions();
  }

  // --- Computed values
  get hasOpenModal() {
    return this.isPhotoModalOpen && this.selectedPhotoId !== null;
  }

  get currentPhotoId() {
    return this.selectedPhotoId;
  }

  // --- Actions
  openPhotoModal(photoId: number) {
    this.isPhotoModalOpen = true;
    this.selectedPhotoId = photoId;

    this.rootStore.photoStore.fetchPhotoDetails(photoId);
  }

  closePhotoModal() {
    this.isPhotoModalOpen = false;
    this.selectedPhotoId = null;

    // --- Clear current photo from PhotoStore
    this.rootStore.photoStore.clearCurrentPhoto();
  }

  // --- Reset modal state
  reset() {
    this.isPhotoModalOpen = false;
    this.selectedPhotoId = null;
  }

  escapeCloseHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.hasOpenModal) {
      this.closePhotoModal();
    }
  };

  // --- Setup modal-related reactions
  private setupModalReactions() {
    reaction(
      () => this.hasOpenModal,
      (isOpen) => {
        if (isOpen) {
          window.addEventListener('keydown', this.escapeCloseHandler);

          // --- Prevent body scroll when modal is open
          if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
          }
        } else {
          window.removeEventListener('keydown', this.escapeCloseHandler);

          // --- Restore body scroll
          if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
          }
        }
      }
    );
  }
}
