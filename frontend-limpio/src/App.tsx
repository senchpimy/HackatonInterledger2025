import React, { type ReactNode } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import CampaignsList from './pages/CampaignsList';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import AuthPage from './pages/Auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import Chatbot from './components/Chatbot'; // Import the Chatbot component

const Navbar: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="shadow-lg" style={{ backgroundColor: 'white' }}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-teal-400 hover:text-teal-300">
          GoFundMe (OP)
        </Link>
        <div>
          <Link
            to="/"
            className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition-colors duration-300"
          >
            Campañas
          </Link>
          <div style={{ width: '16px' }}></div>
          <Link
            to="/chat"
            className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition-colors duration-300"
          >
            Chatbot
          </Link>
          <div style={{ width: '16px' }}></div>
          {isLoading ? null : user ? (
            <>
              <Link
                to="/create"
                className="px-4 py-2 hover:bg-teal-700 rounded-md text-white font-semibold transition-colors duration-300"
              >
                Crear Campaña
              </Link>
              <div style={{ width: '16px' }}></div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold transition-colors duration-300"
              >
                Logout
              </button>
              <div style={{ width: '16px' }}></div>
              <span className="text-gray-400 text-sm truncate" title={user.walletAddress}>
                {user.walletAddress.substring(0, 25)}...
              </span>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC = () => {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: '#111827', color: '#F9FAFB' }}
    >
      <Navbar />
      <main className="container mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<CampaignsList />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/chat" element={<Chatbot />} /> {/* New Chatbot Route */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateCampaign />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
