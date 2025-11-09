import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

// Componente principal
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  // 🚨 ELIMINADO: const [keyId, setKeyId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!username || !password) {
          setError("Nombre de usuario y contraseña son obligatorios.");
          setLoading(false);
          return;
        }
        await login({ username, password });
      } else {
        // 🚨 MODIFICACIÓN: Eliminamos la validación de keyId
        if (!username || !password || !walletAddress) {
          setError("Todos los campos son obligatorios para el registro.");
          setLoading(false);
          return;
        }

        // 🚨 MODIFICACIÓN: Eliminamos keyId de los argumentos de register
        await register({
          username,
          password,
          walletAddress,
        });
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Error en la autenticación. Por favor, verifica tus datos.";
      setError(errorMessage);
      Alert.alert("Error de Autenticación", errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setUsername("");
    setPassword("");
    setWalletAddress("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0f172a" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Text>

          <View style={styles.form}>
            {/* Campo de Nombre de Usuario */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre de Usuario</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Campo de Contraseña */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Campos de Registro */}
            {!isLogin && (
              <>
                <View style={[styles.formGroup, { marginBottom: 30 }]}>
                  <Text style={styles.label}>Wallet Address URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    value={walletAddress}
                    onChangeText={setWalletAddress}
                    placeholder="https://wallet.example.com/users/alice"
                    autoCapitalize="none"
                  />
                </View>
                {/* 🚨 ELIMINADO: Campo de Key ID */}
                {/* 🚨 ELIMINADO: Campo de Private Key */}
              </>
            )}

            {/* Mensaje de Error */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#f87171"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Botón de Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Cargando..." : isLogin ? "Acceder" : "Crear Cuenta"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle de Modo */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? "¿No tienes una cuenta? Regístrate"
                  : "¿Ya tienes una cuenta? Inicia sesión"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ------------------------------------------------------------------
// Estilos de React Native
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0f172a",
  },
  card: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    backgroundColor: "#1f2937",
    padding: 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#d1d5db",
    marginBottom: 5,
  },
  input: {
    height: 45,
    backgroundColor: "#374151",
    borderColor: "#4b5563",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    color: "white",
    fontSize: 16,
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(127, 29, 29, 0.3)",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f87171",
  },
  errorText: {
    marginLeft: 8,
    color: "#f87171",
    fontSize: 14,
  },
  submitButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#3b82f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#6b7280",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
    color: "#60a5fa",
    textDecorationLine: "underline",
  },
});
