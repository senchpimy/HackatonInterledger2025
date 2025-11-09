// src/components/DonationModal.tsx
import { useState, FormEvent } from 'react';

type DonationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  campaignTitle: string;
};

const DonationModal = ({ isOpen, onClose, onSubmit, campaignTitle }: DonationModalProps) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, introduce una cantidad válida.');
      return;
    }
    // Ponemos el modal en estado de carga
    setIsSubmitting(true);
    // Llamamos a la función del padre que hará el trabajo pesado
    await onSubmit(numericAmount);
    // Si la redirección falla, reseteamos para que se pueda intentar de nuevo
    // (Aunque si tiene éxito, el usuario navegará fuera de la página)
    setIsSubmitting(false);
  };
  
  const handleClose = () => {
    if (isSubmitting) return; // No permitir cerrar mientras se procesa
    // Resetear todo al cerrar
    setAmount('');
    setError('');
    setIsSubmitting(false);
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-white w-full max-w-md relative">
        {/* El botón de cerrar ahora llama a nuestra función de reseteo */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl disabled:opacity-50"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-teal-400 mb-2">Donar a</h2>
        <p className="text-lg mb-6 italic">{campaignTitle}</p>

        {/* LÓGICA CONDICIONAL: O mostramos el formulario O el mensaje de carga */}
        {isSubmitting ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold">Procesando tu donación...</h3>
            <p className="text-gray-400 mt-2">Serás redirigido a tu wallet para confirmar el pago.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Cantidad (USD)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">$</span>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-white focus:ring-teal-500 focus:border-teal-500"
                placeholder="50.00"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-colors"
            >
              Continuar al pago
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DonationModal;
