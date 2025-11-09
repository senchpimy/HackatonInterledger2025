import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert, // Usamos Alert para mensajes emergentes en RN
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

// Tipo para el estado del formulario
interface FormData {
  title: string;
  description: string;
  goal: string; // Mantenemos como string para el TextInput
  currency: string;
  paymentPointer: string;
}

const BASE_URL = "http://localhost:8080"; // ⬅️ Ajusta con tu IP si es necesario

export default function CreateCampaignScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    goal: "",
    currency: "USD",
    paymentPointer: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Maneja cambios para TextInput y TextArea (TextInput multiline)
  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.title || !formData.goal || !formData.paymentPointer) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const goalNumber = parseFloat(formData.goal);
      if (isNaN(goalNumber) || goalNumber <= 0) {
        setError("La meta debe ser un número positivo.");
        setLoading(false);
        return;
      }

      await axios.post(`${BASE_URL}/api/campaigns`, {
        ...formData,
        goal: goalNumber,
      });

      router.replace("/");
      Alert.alert("Éxito", "Campaña creada satisfactoriamente.");
    } catch (err) {
      console.error("Error creating campaign:", err);
      // Mostrar un mensaje de error más específico
      setError("No se pudo crear la campaña. Revisa la conexión y el backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Ajuste para el encabezado
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>Inicia tu Campaña</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Título de la Campaña *</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#9ca3af"
              placeholder="Mi Proyecto de Apoyo"
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              required
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholderTextColor="#9ca3af"
              placeholder="Describe tu causa y cómo ayudarán los fondos."
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
            />
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Meta Financiera *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#9ca3af"
                placeholder="5000"
                keyboardType="numeric"
                value={formData.goal}
                onChangeText={(text) => handleChange("goal", text)}
                required
              />
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Moneda</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#9ca3af"
                value={formData.currency}
                onChangeText={(text) => handleChange("currency", text)}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tu Payment Pointer *</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#9ca3af"
              placeholder="$wallet.example.com/alice"
              value={formData.paymentPointer}
              onChangeText={(text) => handleChange("paymentPointer", text)}
              autoCapitalize="none"
              required
            />
            <Text style={styles.helpText}>
              Aquí es donde recibirás las donaciones.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Creando..." : "Crear Campaña"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ------------------------------------------------------------------
// Estilos de React Native (Simulando el look and feel del original)
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: "#0f172a", // Fondo oscuro
  },
  card: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#1f2937", // bg-gray-800
    padding: 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28, // text-3xl
    fontWeight: "bold",
    color: "white",
    marginBottom: 24, // mb-6
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#d1d5db", // text-gray-300
    marginBottom: 5,
  },
  input: {
    height: 40,
    backgroundColor: "#374151", // bg-gray-700
    borderColor: "#4b5563", // border-gray-600
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    color: "white",
    fontSize: 16,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  gridItem: {
    width: "48%", // Simula col-2
  },
  helpText: {
    marginTop: 5,
    fontSize: 12,
    color: "#9ca3af", // text-gray-400
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
  buttonContainer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#059669", // bg-teal-600
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#6b7280", // bg-gray-500
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
