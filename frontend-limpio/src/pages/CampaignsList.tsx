import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Campaign } from '../types';

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const percentage = Math.min((campaign.amountRaised / campaign.goal) * 100, 100);

  return (
    <div className="bg-primary-dark ring-1 ring-neutral-700 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-accent-dark/60 hover:-translate-y-1 hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent h-full">
      <div className="p-6 flex flex-col h-full">
        <h2 className="text-xl font-bold truncate" style={{ color: 'white' }}>{campaign.title}</h2>
        {campaign.creatorUsername && (
          <p className="text-sm italic mt-1" style={{ color: 'white' }}>Creado por: {campaign.creatorUsername}</p>
        )}
        
        <p className="mt-2 line-clamp-2 flex-grow min-h-[40px]" style={{ color: 'white' }}>{campaign.description}</p>
        
        <div className="mt-5">
          <div className="bg-neutral-700 rounded-full h-2.5 w-full">
            <div 
              className="bg-gradient-to-r from-accent-light to-accent h-2.5 rounded-full transition-width duration-500 ease-in-out" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div className="bg-blue-500 border-2 border-red-500 p-2 rounded-lg text-center">
              <span className="font-semibold" style={{ color: 'white' }}>${campaign.amountRaised.toLocaleString()}</span>
            </div>
            <div className="bg-blue-500 border-2 border-red-500 p-2 rounded-lg text-center">
              <span style={{ color: 'white' }}>Meta: ${campaign.goal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignCardSkeleton = () => (
    <div className="bg-primary-dark ring-1 ring-neutral-700 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-neutral-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-neutral-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-neutral-700 rounded w-5/6 mb-6"></div>
        <div className="h-2.5 bg-neutral-700 rounded-full w-full mb-3"></div>
        <div className="flex justify-between items-center">
            <div className="h-5 bg-neutral-700 rounded w-1/4"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/3"></div>
        </div>
    </div>
);


const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const response = await axios.get('/api/campaigns');
        setCampaigns(response.data || []);
      } catch (err) {
        setError('No se pudieron cargar las campañas. Asegúrate de que el servidor backend esté funcionando.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <CampaignCardSkeleton key={i} />)}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-danger bg-danger/20 ring-1 ring-danger/50 p-6 rounded-lg flex flex-col items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="font-semibold">{error}</span>
        </div>
      );
    }
    
    if (campaigns.length === 0) {
        return (
            <div className="text-center bg-primary-dark ring-1 ring-neutral-700 p-10 rounded-xl flex flex-col items-center">
                <h2 className="text-2xl font-bold text-neutral-100">No hay campañas activas</h2>
                <p className="mt-2 text-neutral-300 max-w-md">Parece que aún no se ha creado ninguna campaña. ¿Por qué no eres el primero en iniciar una nueva causa?</p>
                <Link
                    to="/create"
                    className="mt-6 px-6 py-3 bg-accent hover:bg-accent-dark rounded-md text-neutral-50 font-semibold shadow-lg transition-transform duration-200 transform hover:scale-105"
                >
                    Crear Nueva Campaña
                </Link>
            </div>
        )
    }

    return (
      <div className="bg-green-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map(campaign => (
            <Link to={`/campaigns/${campaign.id}`} key={campaign.id} className="block">
              <CampaignCard campaign={campaign} />
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
<h1 className="text-4xl font-extrabold ... bg-red-500">
  Campañas Activas
</h1>
      <div className="h-8"></div>
      {renderContent()}
    </div>
  );
};

export default CampaignsList;
