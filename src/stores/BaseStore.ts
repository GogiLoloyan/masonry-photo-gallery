import type { IReactionDisposer } from 'mobx';

/**
 * Type for disposer functions - can be MobX disposers or regular cleanup functions
 */
type Disposer = IReactionDisposer | (() => void);

/**
 * Base store class with automatic disposal management for MobX reactions
 *
 * This class provides a centralized way to manage all side effects (reactions, autoruns, when)
 * and ensures they are properly disposed when the store is cleaned up.
 *
 * @example
 * ```ts
 * class MyStore extends BaseStore {
 *   constructor() {
 *     super();
 *
 *     // Add reactions
 *     this.addDisposer(
 *       reaction(() => this.value, (val) => console.log(val))
 *     );
 *
 *     // Add autoruns
 *     this.addDisposer(
 *       autorun(() => console.log(this.value))
 *     );
 *
 *     // Add event listeners
 *     const handler = () => {};
 *     window.addEventListener('resize', handler);
 *     this.addDisposer(() => window.removeEventListener('resize', handler));
 *   }
 * }
 * ```
 */
export abstract class BaseStore {
  /**
   * Collection of disposer functions for reactions, autoruns, when, and event listeners
   */
  private disposers: Disposer[] = [];

  /**
   * Add a disposer function to be called during cleanup
   *
   * @param disposer - Function returned by reaction(), autorun(), when(), or custom cleanup
   * @returns The disposer function (for convenience)
   */
  protected addDisposer<T extends Disposer>(disposer: T): T {
    this.disposers.push(disposer);
    return disposer;
  }

  /**
   * Dispose all reactions, autoruns, when, and event listeners
   * Call this method when the store is no longer needed (e.g., component unmount)
   */
  dispose(): void {
    this.disposers.forEach((dispose) => dispose());
    this.disposers = [];
  }

  /**
   * Check if the store has been disposed
   */
  get isDisposed(): boolean {
    return this.disposers.length === 0;
  }
}
