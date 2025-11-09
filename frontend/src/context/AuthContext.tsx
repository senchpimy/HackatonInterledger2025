import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define la forma de los datos del usuario que vienen de la API
interface User {
  id: number;
  username: string;
  walletAddress: string;
  keyId: string;
}

// Argumentos para la función de registro
interface RegisterArgs {
  username: string;
  password: string;
  walletAddress: string;
  keyId: string;
  privateKey: string; // La clave privada se necesita aquí
}

// Argumentos para la función de login
interface LoginArgs {
  username: string;
  password: string;
}

// Define la forma del contexto de autenticación
interface AuthContextType {
  user: User | null;
  privateKey: string | null; // La clave privada vuelve al contexto
  isLoading: boolean;
  login: (args: LoginArgs) => Promise<void>;
  register: (args: RegisterArgs) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedPrivateKey = localStorage.getItem('privateKey');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        // La clave privada también se recupera si existe
        if (storedPrivateKey) {
          setPrivateKey(storedPrivateKey);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.clear(); // Limpia todo si hay un error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async ({ username, password }: LoginArgs) => {
    const response = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to login');
    }

    const userData: User = await response.json();
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // OJO: El login no recupera la clave privada del servidor.
    // Si ya estaba en localStorage, se mantendrá. Si no, el usuario podría necesitar ingresarla de nuevo.
  };

  const register = async ({ username, password, walletAddress, keyId, privateKey }: RegisterArgs) => {
    const response = await fetch('http://localhost:8080/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, walletAddress, keyId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to register');
    }
    
    const newUser: User = await response.json();
    
    // Después de un registro exitoso, guardamos todo
    setUser(newUser);
    setPrivateKey(privateKey);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('privateKey', privateKey);
  };

  const logout = () => {
    setUser(null);
    setPrivateKey(null);
    localStorage.removeItem('user');
    localStorage.removeItem('privateKey');
  };

  return (
    <AuthContext.Provider value={{ user, privateKey, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
