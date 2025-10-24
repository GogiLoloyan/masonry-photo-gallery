import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/common/ErrorBoundary';
import Home from './pages/Home';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
