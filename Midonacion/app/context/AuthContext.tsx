import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ------------------------------------------------------------------
// TIPOS
// ------------------------------------------------------------------

interface User {
  id: number;
  username: string;
  walletAddress: string;
  token?: string;
}

interface RegisterArgs {
  username: string;
  password: string;
  walletAddress: string;
}

interface LoginArgs {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (args: LoginArgs) => Promise<void>;
  register: (args: RegisterArgs) => Promise<void>;
  logout: () => Promise<void>;
}

// ------------------------------------------------------------------
// CONFIGURACIÓN
// ------------------------------------------------------------------

const BASE_URL = "http://localhost:8080/api";
const USER_KEY = "user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ------------------------------------------------------------------
// PROVEEDOR DE AUTENTICACIÓN
// ------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial del almacenamiento asíncrono
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedUser) {
          const userData: User = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Fallo al cargar datos de auth de AsyncStorage", error);
        await AsyncStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const login = async ({ username, password }: LoginArgs) => {
    const url = `${BASE_URL}/login`;

    const response = await axios.post(url, { username, password });

    const userData: User = response.data;

    setUser(userData);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const register = async ({
    username,
    password,
    walletAddress,
  }: // 🚨 MODIFICACIÓN: keyId eliminado de la desestructuración
  RegisterArgs) => {
    const url = `${BASE_URL}/register`;

    // 🚨 MODIFICACIÓN: keyId eliminado del payload del request
    const response = await axios.post(url, {
      username,
      password,
      walletAddress,
    });

    const newUser: User = response.data;

    setUser(newUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ------------------------------------------------------------------
// HOOK PERSONALIZADO
// ------------------------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
