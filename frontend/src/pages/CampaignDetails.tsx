// src/pages/CampaignDetails.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { Campaign } from '../types';
import DonationModal from '../components/DonationModal';

type PaymentStep = 'idle' | 'creatingDonation' | 'initiatingPayment' | 'waitingForApproval' | 'finalizing' | 'success' | 'error';

interface IncomingPaymentResponse {
  ID: string;
}

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [interactRef, setInteractRef] = useState<string | null>(null);

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
    if (!campaign) return;

    setPaymentStep('creatingDonation');
    setPaymentError(null);
    setIsModalOpen(false);

    try {
      const donationResponse = await axios.post<IncomingPaymentResponse>(
        `/api/campaigns/${campaign.id}/donations`,
        { amount, currency: campaign.currency }
      );
      const incomingPaymentId = donationResponse.data.ID;

      if (!incomingPaymentId) {
        throw new Error("La respuesta del servidor no incluyó un ID de pago válido.");
      }

      setPaymentStep('initiatingPayment');
      const initiateResponse = await axios.post('/api/payments/initiate', {
        incomingPaymentId,
      });
      const redirectUrl = initiateResponse.data.redirectUrl;

      // --- INICIO DE LA CORRECCIÓN ---
      const urlParts = redirectUrl.split('/');
      let ref = urlParts[urlParts.length - 1]; // Obtenemos la última parte de la URL

      // Limpiamos los parámetros de consulta (?...) de la referencia
      if (ref.includes('?')) {
        ref = ref.split('?')[0];
      }
      // --- FIN DE LA CORRECCIÓN ---
      
      setInteractRef(ref); // Guardamos la referencia ya limpia

      window.open(redirectUrl, '_blank');
      setPaymentStep('waitingForApproval');

    } catch (err: any) {
      console.error("Error durante el proceso de donación:", err);
      const errorMessage = err.response?.data || err.message || 'Ocurrió un error al procesar el pago.';
      setPaymentError(errorMessage);
      setPaymentStep('error');
    }
  };
  
  const handleFinalizePayment = async () => {
    if (!interactRef) return;
    
    setPaymentStep('finalizing');
    setPaymentError(null);

    try {
      await axios.post('/api/payments/finalize', {
        interactRef, // Ahora se envía la referencia limpia
      });
      setPaymentStep('success');
    } catch (err: any) {
       console.error("Error al finalizar el pago:", err);
       const errorMessage = err.response?.data || 'No se pudo confirmar el pago.';
       setPaymentError(errorMessage);
       setPaymentStep('error');
    }
  };

  const resetPaymentFlow = () => {
    setPaymentStep('idle');
    setPaymentError(null);
    setInteractRef(null);
  }

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
          {paymentStep === 'idle' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-10 rounded-lg text-xl transition-transform duration-300 transform hover:scale-105"
            >
              Donar ahora
            </button>
          )}
          {(paymentStep === 'creatingDonation' || paymentStep === 'initiatingPayment') && (
            <p className="text-yellow-400">Procesando tu donación...</p>
          )}
          {paymentStep === 'waitingForApproval' && (
            <div className="bg-blue-900/50 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-blue-300 mb-2">Acción requerida</h3>
              <p className="mb-4">Hemos abierto una nueva pestaña para que apruebes el pago. Una vez que lo hayas hecho, vuelve aquí y haz clic en finalizar.</p>
              <button
                onClick={handleFinalizePayment}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
              >
                He aprobado el pago, ¡Finalizar!
              </button>
            </div>
          )}
          {paymentStep === 'finalizing' && (
             <p className="text-yellow-400">Finalizando la transacción. ¡Un momento!</p>
          )}
          {paymentStep === 'success' && (
            <div className="bg-green-900/50 p-4 rounded-lg">
               <h3 className="text-2xl font-bold text-green-300">¡Gracias por tu donación!</h3>
               <p>Tu pago ha sido procesado con éxito.</p>
               <button onClick={resetPaymentFlow} className="mt-4 text-sm text-teal-400 hover:underline">Hacer otra donación</button>
            </div>
          )}
          {paymentStep === 'error' && (
            <div className="bg-red-900/50 p-4 rounded-lg">
               <h3 className="text-xl font-bold text-red-400">Error en el pago</h3>
               <p className="text-red-300">{paymentError}</p>
               <button onClick={resetPaymentFlow} className="mt-4 bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded">Intentar de nuevo</button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Las donaciones se procesan vía Open Payments.</p>
        </div>
      </div>

      <DonationModal
        isOpen={isModalOpen && paymentStep === 'idle'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleDonateSubmit}
        campaignTitle={campaign.title}
      />
    </>
  );
};

export default CampaignDetails;
