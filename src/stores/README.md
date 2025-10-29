# MobX Store Architecture

This directory contains the MobX stores for state management with proper disposal patterns.

## BaseStore

The `BaseStore` abstract class provides automatic disposal management for MobX reactions, autoruns, when, and event listeners.

### Why Use BaseStore?

MobX reactions (`reaction`, `autorun`, `when`) create subscriptions that must be disposed to prevent memory leaks. The `BaseStore` class provides a centralized pattern for managing these disposals.

### Usage

#### Basic Example

```typescript
import { BaseStore } from './BaseStore';
import { reaction, autorun, when } from 'mobx';

class MyStore extends BaseStore {
  @observable counter = 0;

  constructor() {
    super();

    // Add MobX reactions
    this.addDisposer(
      reaction(
        () => this.counter,
        (value) => console.log('Counter changed:', value)
      )
    );

    // Add autoruns
    this.addDisposer(
      autorun(() => {
        console.log('Current counter:', this.counter);
      })
    );

    // Add when (runs once)
    this.addDisposer(
      when(
        () => this.counter > 10,
        () => console.log('Counter exceeded 10!')
      )
    );
  }

  increment() {
    this.counter++;
  }
}

// Usage
const store = new MyStore();
store.increment(); // Logs: "Current counter: 1", "Counter changed: 1"

// When done, clean up all reactions
store.dispose(); // All reactions are disposed, no memory leaks!
```

#### Event Listeners

```typescript
class WindowStore extends BaseStore {
  @observable width = window.innerWidth;

  constructor() {
    super();

    const handleResize = () => {
      this.width = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);

    // Add cleanup for event listener
    this.addDisposer(() => {
      window.removeEventListener('resize', handleResize);
    });
  }
}
```

#### Intervals and Timeouts

```typescript
class TimerStore extends BaseStore {
  @observable time = 0;

  constructor() {
    super();

    const intervalId = setInterval(() => {
      this.time++;
    }, 1000);

    // Clean up interval
    this.addDisposer(() => {
      clearInterval(intervalId);
    });
  }
}
```

#### React Component Integration

```typescript
function MyComponent() {
  const [store] = useState(() => new MyStore());

  useEffect(() => {
    // Clean up when component unmounts
    return () => store.dispose();
  }, [store]);

  return <div>{store.counter}</div>;
}
```

### API

#### `addDisposer<T>(disposer: T): T`

Adds a disposer function to be called during cleanup.

- **Parameters**:
  - `disposer`: Function returned by `reaction()`, `autorun()`, `when()`, or custom cleanup function
- **Returns**: The disposer function (for convenience)

#### `dispose(): void`

Disposes all reactions, autoruns, when, and event listeners. Call this when the store is no longer needed.

#### `isDisposed: boolean`

Returns `true` if the store has been disposed.

## Store Examples in This Project

### UIStore

The `UIStore` extends `BaseStore` and demonstrates:
- MobX reaction for modal state management
- Event listener cleanup for window resize
- Custom cleanup method that calls `dispose()`

```typescript
export class UIStore extends BaseStore {
  constructor(rootStore: RootStore) {
    super();

    // Add modal reaction
    this.addDisposer(
      reaction(
        () => this.hasOpenModal,
        (isOpen) => {
          // Handle modal open/close side effects
        }
      )
    );

    // Add resize listener
    const handleResize = () => this.updateViewportDimensions();
    window.addEventListener('resize', handleResize);
    this.addDisposer(() => window.removeEventListener('resize', handleResize));
  }

  cleanup() {
    this.dispose(); // Clean up all reactions and listeners
    this.reset();   // Reset state
  }
}
```

## Best Practices

1. **Always call `super()`** in the constructor before using `this.addDisposer()`
2. **Add disposers immediately** after creating reactions/listeners
3. **Call `dispose()`** when the store is no longer needed (e.g., component unmount)
4. **Don't forget event listeners** - they need cleanup too!
5. **Use in React** with `useEffect` cleanup to prevent memory leaks

## Common Pitfalls

### ❌ Forgetting to dispose

```typescript
const store = new MyStore();
// Store is never disposed - memory leak!
```

### ✅ Proper disposal

```typescript
const store = new MyStore();
// ... use store ...
store.dispose(); // Clean up when done
```

### ❌ Not adding event listener cleanup

```typescript
constructor() {
  super();
  window.addEventListener('resize', this.handleResize);
  // Missing: this.addDisposer(() => window.removeEventListener(...))
}
```

### ✅ Adding event listener cleanup

```typescript
constructor() {
  super();
  window.addEventListener('resize', this.handleResize);
  this.addDisposer(() => window.removeEventListener('resize', this.handleResize));
}
```
