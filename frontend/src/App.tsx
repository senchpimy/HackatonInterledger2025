// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CampaignsList from './pages/CampaignsList';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';

function App() {
  return (
    <Router>
      <div
        className="min-h-screen font-sans"
        style={{ backgroundColor: '#111827', color: '#F9FAFB' }}
      >
        <header className="shadow-lg" style={{ backgroundColor: '#0D1117' }}>
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
              <Link
                to="/create"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold ml-4 transition-colors duration-300"
              >
                Crear Campaña
              </Link>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<CampaignsList />} />
            <Route path="/create" element={<CreateCampaign />} /> 
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
