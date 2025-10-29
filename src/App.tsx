import { ErrorBoundary } from './components/common/ErrorBoundary';
import Home from './pages/Home';
import { StoreProvider } from './stores/RootStore';

function App() {
  return (
    <StoreProvider>
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    </StoreProvider>
  );
}

export default App;
