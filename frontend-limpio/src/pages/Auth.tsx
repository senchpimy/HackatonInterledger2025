import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        if (!username || !password) {
          setError('Nombre de usuario y contraseña son obligatorios.');
          return;
        }
        await login({ username, password });
      } else {
        if (!username || !password || !walletAddress) {
          setError('Todos los campos son obligatorios para el registro.');
          return;
        }
        await register({ username, password, walletAddress });
      }
      navigate('/'); // Redirige al inicio después del éxito
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación. Por favor, verifica tus datos.');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto max-w-md mt-10 p-8 rounded-lg shadow-xl bg-primary-dark text-neutral-100 border border-primary-light">
      <h2 className="text-3xl font-bold mb-8 text-center text-accent-light">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-neutral-300">
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-primary-light border border-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent text-neutral-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-primary-light border border-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent text-neutral-50"
          />
        </div>

        {!isLogin && (
          <>
            <div className="mb-4">
              <label htmlFor="walletAddress" className="block text-sm font-medium text-neutral-300">
                Wallet Address URL
              </label>
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-primary-light border border-primary-dark rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent text-neutral-50"
                placeholder="https://wallet.example.com/users/alice"
              />
            </div>
          </>
        )}

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-accent text-neutral-50 py-2 px-4 rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          {isLogin ? 'Acceder' : 'Crear Cuenta'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-accent-light hover:underline"
        >
          {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
