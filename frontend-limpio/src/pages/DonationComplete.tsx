// src/pages/DonationComplete.tsx (VERSIÓN FINAL Y FUNCIONAL)
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const DonationComplete = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    const finalizePayment = async () => {
      // ***** LA LÍNEA CLAVE CORREGIDA *****
      // En lugar de leer 'location.hash', leemos 'location.search' (los parámetros después del '?')
      const searchParams = new URLSearchParams(location.search);
      
      // El resto del código funciona igual
      const interactRef = searchParams.get('interact_ref');
      // A menudo, las wallets también devuelven el resultado de la interacción
      const result = searchParams.get('result'); 

      if (result === 'grant_rejected') {
        setStatus('error');
        setErrorMessage('El pago fue cancelado o rechazado desde la wallet.');
        return;
      }
      
      if (!interactRef) {
        setStatus('error');
        setErrorMessage('No se encontró la referencia de interacción en la URL de retorno. No se puede finalizar el pago.');
        return;
      }

      try {
        // Ahora que tenemos el 'interactRef', llamamos a nuestro backend para finalizar
        await axios.post('/api/payments/finalize', { interactRef });
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        const serverError = err.response?.data?.error || err.response?.data || 'Ocurrió un error desconocido al finalizar el pago.';
        setErrorMessage(serverError);
      }
    };

    // Verificamos que 'location.search' tenga contenido
    if (location.search) {
      finalizePayment();
    } else {
        setStatus('error');
        setErrorMessage('URL de retorno inválida. Faltan los parámetros de finalización.');
    }
  }, [location]);

  return (
    <div className="max-w-2xl mx-auto text-center p-8 bg-gray-800 rounded-lg shadow-lg mt-10">
      {status === 'processing' && (
        <>
          <h1 className="text-3xl font-bold text-white mb-4">Procesando tu donación...</h1>
          <p className="text-gray-400">Estamos confirmando el pago con el servidor. Por favor, espera un momento.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-3xl font-bold text-teal-400 mb-4">¡Donación completada!</h1>
          <p className="text-gray-300">Tu generosidad hace la diferencia. ¡Muchas gracias! El pago se ha procesado correctamente.</p>
          <Link to="/" className="mt-6 inline-block bg-teal-600 text-white font-bold py-2 px-6 rounded hover:bg-teal-700 transition-colors">
            Volver al inicio
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error en la Donación</h1>
          <p className="text-gray-300">No se pudo completar el proceso de pago.</p>
          <div className="text-sm text-red-300 mt-4 bg-red-900/30 p-3 rounded-md text-left">
            <strong>Detalle:</strong> {errorMessage}
          </div>
          <Link to="/" className="mt-6 inline-block bg-gray-600 text-white font-bold py-2 px-6 rounded hover:bg-gray-700 transition-colors">
            Volver al inicio
          </Link>
        </>
      )}
    </div>
  );
};

export default DonationComplete;
