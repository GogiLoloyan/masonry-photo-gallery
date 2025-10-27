import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { throttle } from '../utils/performance';
import type { RootStore } from './RootStore';

export class UIStore {
  rootStore: RootStore;

  // --- Modal state
  isPhotoModalOpen = false;
  selectedPhotoId: number | null = null;

  // --- Scroll state
  scrollTop = 0;
  private readonly THROTTLE_DELAY = 16; // ~60fps

  // --- Viewport state
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

  // --- Container state
  containerWidth = 0;
  containerElement: HTMLElement | null = null;

  throttledUpdateScroll: (value: number) => void;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeObservable(this, {
      // --- Observable state
      isPhotoModalOpen: observable,
      selectedPhotoId: observable,
      scrollTop: observable,
      viewportHeight: observable,
      containerWidth: observable,

      // --- Computed values
      hasOpenModal: computed,
      currentPhotoId: computed,

      // -- Actions
      handleScroll: action,
      openPhotoModal: action,
      closePhotoModal: action,
      reset: action,
      updateViewportDimensions: action,
    });

    this.throttledUpdateScroll = throttle((value: number) => {
      this.scrollTop = value;
    }, this.THROTTLE_DELAY);

    // --- Initialize reactions
    this.setupModalReactions();

    this.initializeResizeListener();
  }

  // --- Computed values
  get hasOpenModal() {
    return this.isPhotoModalOpen && this.selectedPhotoId !== null;
  }

  get currentPhotoId() {
    return this.selectedPhotoId;
  }

  // --- Actions
  handleScroll(newScrollTop: number) {
    this.throttledUpdateScroll(newScrollTop);
  }

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

  updateViewportDimensions() {
    if (typeof window === 'undefined') return;

    this.viewportHeight = window.innerHeight;
    this.viewportWidth = window.innerWidth;
  }

  setContainerElement(element: HTMLElement | null) {
    if (element) {
      this.containerWidth = element.offsetWidth;
    }
    this.containerElement = element;
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

  private initializeResizeListener() {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      this.updateViewportDimensions();
      if (this.containerElement) {
        this.containerWidth = this.containerElement.offsetWidth;
      }
    };

    window.addEventListener('resize', handleResize);

    // Store cleanup function (can be called in reset or component unmount)
    (this as any).cleanupResize = () => {
      window.removeEventListener('resize', handleResize);
    };
  }

  reset() {
    // Reset modal
    this.isPhotoModalOpen = false;
    this.selectedPhotoId = null;

    // Reset scroll
    this.scrollTop = 0;

    // Reset viewport (to current values)
    this.updateViewportDimensions();

    // Reset container
    this.setContainerElement(null);

    // Ensure body scroll is restored
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  // --- Cleanup method
  cleanup() {
    if ((this as any).cleanupResize) {
      (this as any).cleanupResize();
    }
    this.reset();
  }
}
