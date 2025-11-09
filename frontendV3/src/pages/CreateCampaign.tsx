// src/pages/CreateCampaign.tsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtener el usuario del contexto
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    currency: 'USD',
    paymentPointer: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Debes iniciar sesión para crear una campaña.');
      return;
    }

    if (!formData.title || !formData.goal || !formData.paymentPointer) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const goalNumber = parseFloat(formData.goal);
      if (isNaN(goalNumber) || goalNumber <= 0) {
        setError('La meta debe ser un número positivo.');
        setLoading(false);
        return;
      }

      await axios.post('/api/campaigns', {
        ...formData,
        goal: goalNumber,
        userId: user.id, // Añadir el ID del usuario a la petición
      });
      
      navigate('/');

    } catch (err) {
      console.error('Error creating campaign:', err);
      setError('No se pudo crear la campaña. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-primary-dark p-8 rounded-lg shadow-xl text-neutral-100">
      <h1 className="text-3xl font-bold text-accent mb-6">Inicia tu Campaña</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-100">Título de la Campaña *</label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full bg-primary-light border-primary rounded-md shadow-sm text-neutral-50 focus:ring-accent focus:border-accent"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-100">Descripción</label>
          <textarea
            name="description"
            id="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full bg-primary-light border-primary rounded-md shadow-sm text-neutral-50 focus:ring-accent focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-neutral-100">Meta Financiera *</label>
            <input
              type="number"
              name="goal"
              id="goal"
              value={formData.goal}
              onChange={handleChange}
              className="mt-1 block w-full bg-primary-light border-primary rounded-md shadow-sm text-neutral-50 focus:ring-accent focus:border-accent"
              placeholder="5000"
              required
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-neutral-100">Moneda</label>
            <input
              type="text"
              name="currency"
              id="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full bg-primary-light border-primary rounded-md shadow-sm text-neutral-50 focus:ring-accent focus:border-accent"
              disabled
            />
          </div>
        </div>

        <div>
          <label htmlFor="paymentPointer" className="block text-sm font-medium text-neutral-100">Tu Payment Pointer *</label>
          <input
            type="text"
            name="paymentPointer"
            id="paymentPointer"
            value={formData.paymentPointer}
            onChange={handleChange}
            className="mt-1 block w-full bg-primary-light border-primary rounded-md shadow-sm text-neutral-50 focus:ring-accent focus:border-accent"
            placeholder="$wallet.example.com/alice"
            required
          />
          <p className="mt-2 text-xs text-neutral-300">Aquí es donde recibirás las donaciones.</p>
        </div>

        {error && <div className="text-danger bg-danger/20 p-3 rounded-md">{error}</div>}

        <div className="text-right">
          <button 
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-neutral-50 bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-secondary"
          >
            {loading ? 'Creando...' : 'Crear Campaña'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
