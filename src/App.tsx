import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/common/ErrorBoundary';
import Home from './pages/Home';
import { StoreProvider } from './stores/RootStore';

function App() {
  return (
    <StoreProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </StoreProvider>
  );
}

export default App;
