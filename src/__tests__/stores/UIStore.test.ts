import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RootStore } from '@/stores/RootStore';
import { UIStore } from '@/stores/Uistore';

describe('UIStore', () => {
  let rootStore: RootStore;
  let uiStore: UIStore;

  beforeEach(() => {
    // Mock window methods BEFORE creating stores
    global.window = {
      innerHeight: 768,
      innerWidth: 1024,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;

    global.document = {
      body: {
        style: {
          overflow: '',
        },
      },
    } as any;

    // Mock KeyboardEvent for Node.js environment
    global.KeyboardEvent = class KeyboardEvent extends Event {
      key: string;
      constructor(type: string, options?: { key?: string }) {
        super(type);
        this.key = options?.key || '';
      }
    } as any;

    rootStore = new RootStore();
    uiStore = rootStore.uiStore;
  });

  afterEach(() => {
    uiStore.cleanup();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      expect(uiStore.isPhotoModalOpen).toBe(false);
      expect(uiStore.selectedPhotoId).toBeNull();
      expect(uiStore.scrollTop).toBe(0);
      expect(uiStore.viewportHeight).toBe(768);
      expect(uiStore.viewportWidth).toBe(1024);
      expect(uiStore.containerWidth).toBe(0);
      expect(uiStore.containerElement).toBeNull();
    });
  });

  describe('Modal Management', () => {
    it('should open photo modal', () => {
      const fetchPhotoDetailsSpy = vi.spyOn(rootStore.photoStore, 'fetchPhotoDetails');

      uiStore.openPhotoModal(123);

      expect(uiStore.isPhotoModalOpen).toBe(true);
      expect(uiStore.selectedPhotoId).toBe(123);
      expect(fetchPhotoDetailsSpy).toHaveBeenCalledWith(123);
    });

    it('should close photo modal', () => {
      const clearCurrentPhotoSpy = vi.spyOn(rootStore.photoStore, 'clearCurrentPhoto');

      // First open modal
      uiStore.openPhotoModal(123);

      // Then close it
      uiStore.closePhotoModal();

      expect(uiStore.isPhotoModalOpen).toBe(false);
      expect(uiStore.selectedPhotoId).toBeNull();
      expect(clearCurrentPhotoSpy).toHaveBeenCalled();
    });

    it('should prevent body scroll when modal is open', () => {
      uiStore.openPhotoModal(123);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      uiStore.openPhotoModal(123);
      uiStore.closePhotoModal();
      expect(document.body.style.overflow).toBe('');
    });

    it('should add escape key listener when modal opens', () => {
      uiStore.openPhotoModal(123);
      expect(window.addEventListener).toHaveBeenCalledWith('keydown', uiStore.escapeCloseHandler);
    });

    it('should remove escape key listener when modal closes', () => {
      uiStore.openPhotoModal(123);
      uiStore.closePhotoModal();
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'keydown',
        uiStore.escapeCloseHandler
      );
    });

    it('should close modal on escape key press', () => {
      uiStore.openPhotoModal(123);

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      uiStore.escapeCloseHandler(escapeEvent);

      expect(uiStore.isPhotoModalOpen).toBe(false);
      expect(uiStore.selectedPhotoId).toBeNull();
    });

    it('should not close modal on other key press', () => {
      uiStore.openPhotoModal(123);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      uiStore.escapeCloseHandler(enterEvent);

      expect(uiStore.isPhotoModalOpen).toBe(true);
      expect(uiStore.selectedPhotoId).toBe(123);
    });
  });

  describe('Scroll Management', () => {
    it('should update scroll position through throttled function', () => {
      vi.useFakeTimers();

      // First call executes immediately (throttle behavior)
      uiStore.handleScroll(100);
      expect(uiStore.scrollTop).toBe(100);

      // Subsequent calls within throttle period are ignored
      uiStore.handleScroll(200);
      expect(uiStore.scrollTop).toBe(100);

      // After throttle period, next call executes
      vi.advanceTimersByTime(16);
      uiStore.handleScroll(300);
      expect(uiStore.scrollTop).toBe(300);

      vi.useRealTimers();
    });

    it('should handle multiple scroll updates', () => {
      vi.useFakeTimers();

      uiStore.handleScroll(100);
      vi.advanceTimersByTime(16);

      uiStore.handleScroll(200);
      vi.advanceTimersByTime(16);

      expect(uiStore.scrollTop).toBe(200);

      vi.useRealTimers();
    });
  });

  describe('Viewport Dimensions', () => {
    it('should update viewport dimensions', () => {
      global.window.innerHeight = 1080;
      global.window.innerWidth = 1920;

      uiStore.updateViewportDimensions();

      expect(uiStore.viewportHeight).toBe(1080);
      expect(uiStore.viewportWidth).toBe(1920);
    });

    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      // Should not throw
      expect(() => uiStore.updateViewportDimensions()).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('Container Management', () => {
    it('should set container element and width', () => {
      const mockElement = {
        offsetWidth: 800,
      } as HTMLElement;

      uiStore.setContainerElement(mockElement);

      expect(uiStore.containerElement).toBe(mockElement);
      expect(uiStore.containerWidth).toBe(800);
    });

    it('should handle null container element', () => {
      uiStore.setContainerElement(null);

      expect(uiStore.containerElement).toBeNull();
      // containerWidth should not change when element is null
      expect(uiStore.containerWidth).toBe(0);
    });

    it('should update container width on resize', () => {
      const mockElement = {
        offsetWidth: 800,
      };

      uiStore.setContainerElement(mockElement as HTMLElement);

      // Simulate resize
      mockElement.offsetWidth = 1200;
      const resizeHandler = (window.addEventListener as any).mock.calls.find(
        (call: any) => call[0] === 'resize'
      )?.[1];

      if (resizeHandler) {
        resizeHandler();
        expect(uiStore.containerWidth).toBe(1200);
      }
    });
  });

  describe('Computed Values', () => {
    it('should compute hasOpenModal correctly', () => {
      expect(uiStore.hasOpenModal).toBe(false);

      uiStore.openPhotoModal(123);
      expect(uiStore.hasOpenModal).toBe(true);

      uiStore.closePhotoModal();
      expect(uiStore.hasOpenModal).toBe(false);
    });

    it('should compute currentPhotoId correctly', () => {
      expect(uiStore.currentPhotoId).toBeNull();

      uiStore.openPhotoModal(456);
      expect(uiStore.currentPhotoId).toBe(456);
    });
  });

  describe('Reset and Cleanup', () => {
    it('should reset all state', () => {
      // Set some state
      uiStore.openPhotoModal(123);
      uiStore.handleScroll(500);
      const mockElement = { offsetWidth: 800 } as HTMLElement;
      uiStore.setContainerElement(mockElement);

      // Reset
      uiStore.reset();

      expect(uiStore.isPhotoModalOpen).toBe(false);
      expect(uiStore.selectedPhotoId).toBeNull();
      expect(uiStore.scrollTop).toBe(0);
      expect(uiStore.containerElement).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });

    it('should cleanup resources', () => {
      const resizeHandler = (window.addEventListener as any).mock.calls.find(
        (call: any) => call[0] === 'resize'
      )?.[1];

      uiStore.cleanup();

      if (resizeHandler) {
        expect(window.removeEventListener).toHaveBeenCalledWith('resize', resizeHandler);
      }
    });
  });

  describe('Resize Listener', () => {
    it('should initialize resize listener on construction', () => {
      // The resize listener is added during UIStore construction
      // Since we create the store in beforeEach, we can check the addEventListener was called
      expect(window.addEventListener).toHaveBeenCalled();

      // Check that resize listener was added
      const resizeCalls = (window.addEventListener as any).mock.calls.filter(
        (call: any) => call[0] === 'resize'
      );
      expect(resizeCalls.length).toBeGreaterThan(0);
    });

    it('should update dimensions on window resize', () => {
      const resizeHandler = (window.addEventListener as any).mock.calls.find(
        (call: any) => call[0] === 'resize'
      )?.[1];

      global.window.innerHeight = 600;
      global.window.innerWidth = 800;

      if (resizeHandler) {
        resizeHandler();
        expect(uiStore.viewportHeight).toBe(600);
        expect(uiStore.viewportWidth).toBe(800);
      }
    });
  });
});
