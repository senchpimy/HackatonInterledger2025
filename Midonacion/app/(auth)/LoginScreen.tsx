import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView, // Para manejar el teclado en dispositivos
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Para iconos visuales

// Importamos el hook de autenticación (Necesario para la llamada real a la API)
// import { useAuth } from "../context/AuthContext";

export default function LoginRegisterScreen() {
  const router = useRouter();
  // const { login, register } = useAuth(); // Descomentar para la lógica real

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState(""); // ⬅️ Añadido para el registro
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    // 1. Validaciones mínimas
    if (!password || (!isLogin && (!username || !walletAddress))) {
      setError("Por favor, complete todos los campos.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log("Intentando Login con:", username, password);
        // 🚨 Reemplazar por la llamada real: await login({ username, password });
      } else {
        console.log(
          "Intentando Registro con:",
          username,
          password,
          walletAddress
        );
        // 🚨 Reemplazar por la llamada real: await register({ username, password, walletAddress });
      }

      // Simulación de éxito
      router.replace("/");
    } catch (err: any) {
      // Manejar error de API y actualizar el estado
      const apiError =
        err.response?.data?.message || "Ocurrió un error. Inténtalo de nuevo.";
      setError(apiError);
      console.error("Auth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formTitle = isLogin ? "Iniciar Sesión" : "Crear Cuenta";
  const buttonText = isLogin ? "Entrar" : "Registrarse";
  const switchText = isLogin
    ? "¿No tienes cuenta? Regístrate en AIDLOOP"
    : "¿Ya tienes cuenta? Inicia Sesión";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.card}>
        {/* Nombre de la Aplicación */}
        <Text style={styles.appTitle}>AIDLOOP</Text>

        {/* Título del Formulario */}
        <Text style={styles.formTitle}>{formTitle}</Text>

        {/* Campo de Nombre de Usuario (Obligatorio en ambos para tu estructura actual) */}
        <View style={styles.inputGroup}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#9ca3af"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre de Usuario"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Campo de Wallet (Solo en el registro) */}
        {!isLogin && (
          <View style={styles.inputGroup}>
            <Ionicons
              name="wallet-outline"
              size={20}
              color="#9ca3af"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Wallet Address (Open Payment Pointer)"
              placeholderTextColor="#9ca3af"
              value={walletAddress}
              onChangeText={setWalletAddress}
              autoCapitalize="none"
            />
          </View>
        )}

        {/* Campo de Contraseña */}
        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#9ca3af"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#9ca3af"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Mensaje de Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Botón Principal (Login o Registro) */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? (isLogin ? "Iniciando..." : "Creando...") : buttonText}
          </Text>
        </TouchableOpacity>

        {/* Enlace para cambiar entre Login y Registro */}
        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            setError(null); // Limpiar errores al cambiar
          }}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>{switchText}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ------------------------------------------------------------------
// Estilos (Diseño Oscuro)
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a", // Fondo muy oscuro (bg-gray-900)
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1f2937", // bg-gray-800
    borderRadius: 12,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#34d399", // Verde-Teal brillante
    textAlign: "center",
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "white",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151", // Fondo de input más oscuro (bg-gray-700)
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#4b5563", // Borde sutil
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "white",
    fontSize: 16,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(127, 29, 29, 0.3)", // bg-red-900/30
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f87171",
  },
  errorText: {
    marginLeft: 8,
    color: "#f87171", // text-red-400
    fontSize: 14,
  },
  button: {
    backgroundColor: "#059669", // Botón verde (bg-teal-600)
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#6b7280", // Gris si está cargando
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  switchText: {
    color: "#34d399", // Texto de enlace verde
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
