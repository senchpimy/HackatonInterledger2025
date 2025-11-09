// src/pages/CampaignDetails.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { Campaign } from '../types';
import DonationModal from '../components/DonationModal';

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`/api/campaigns/${id}`);
        setCampaign(response.data);
      } catch (err) {
        setError('No se pudo cargar la campaña.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleDonateSubmit = async (amount: number) => {
    if (!campaign) return null;
    try {
      const response = await axios.post(`/api/campaigns/${campaign.id}/donations`, {
        amount,
        currency: campaign.currency,
      });
      return response.data;
    } catch (err) {
      console.error("Error creating donation request:", err);
      return null;
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Cargando campaña...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 bg-red-900/20 p-4 rounded-md">{error}</div>;
  }

  if (!campaign) {
    return <div className="text-center text-gray-500">Campaña no encontrada.</div>;
  }

  const progressPercentage = (campaign.amountRaised / campaign.goal) * 100;

  return (
    <>
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg text-white">
        <h1 className="text-4xl font-bold text-teal-400 mb-2">{campaign.title}</h1>
        {campaign.creatorUsername && (
          <p className="text-gray-500 text-lg italic mb-4">Creado por: {campaign.creatorUsername}</p>
        )}
        
        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed">{campaign.description}</p>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-2 text-lg">
            <span className="font-semibold text-white">
              ${campaign.amountRaised.toLocaleString()}
              <span className="text-sm text-gray-400"> recaudados</span>
            </span>
            <span className="text-sm text-gray-400">
              Meta: ${campaign.goal.toLocaleString()}
            </span>
          </div>
          <div className="bg-gray-600 rounded-full h-4">
            <div 
              className="bg-teal-500 h-4 rounded-full" 
              style={{ width: `${progressPercentage > 100 ? 100 : progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-10 rounded-lg text-xl transition-transform duration-300 transform hover:scale-105"
          >
            Donar ahora
          </button>
          <p className="text-xs text-gray-500 mt-2">Las donaciones se procesan vía Open Payments.</p>
        </div>
      </div>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleDonateSubmit}
        campaignTitle={campaign.title}
      />
    </>
  );
};

export default CampaignDetails;
