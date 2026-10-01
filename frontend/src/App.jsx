import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Workspace from './pages/Workspace';
import Dashboard from './pages/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{ style: { background: '#333', color: '#fff' } }} 
      />
      <Routes>
        {/* Auth Page is Public */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Pages */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/workspace/:roomId" element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;