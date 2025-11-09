import { useState } from 'react';
import type { DonationResponse } from '../types';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<DonationResponse | null>;
  campaignTitle: string;
}

const DonationModal = ({ isOpen, onClose, onSubmit, campaignTitle }: DonationModalProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donationResponse, setDonationResponse] = useState<DonationResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, ingresa un monto válido.');
      return;
    }
    setLoading(true);
    const response = await onSubmit(numericAmount);
    if (response) {
      setDonationResponse(response);
    } else {
      setError('Ocurrió un error al procesar la donación.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setAmount('');
    setError(null);
    setDonationResponse(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Donar a "{campaignTitle}"</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        {!donationResponse ? (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-400 mb-4">Ingresa el monto que deseas donar.</p>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Monto (USD)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-teal-500 focus:border-teal-500"
                placeholder="10.00"
                step="0.01"
              />
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <div className="text-right">
              <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-md text-white font-semibold disabled:bg-gray-500">
                {loading ? 'Procesando...' : 'Continuar'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-green-400">¡Gracias! Solicitud de pago generada.</h3>
            <p className="text-gray-400 mt-2">Usa los siguientes detalles en tu billetera compatible con Open Payments para completar la donación:</p>
            <div className="mt-4 bg-gray-900 p-4 rounded-md text-sm font-mono break-all">
              <p><span className="font-bold text-gray-300">ILP Address:</span> {donationResponse.ilpStreamConnection.ilpAddress}</p>
              <p className="mt-2"><span className="font-bold text-gray-300">Shared Secret:</span> {donationResponse.ilpStreamConnection.sharedSecret}</p>
            </div>
            <button onClick={handleClose} className="w-full mt-6 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationModal;
