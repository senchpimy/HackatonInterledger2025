import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import type { Campaign } from "../../types";

const DonationModal = ({ isOpen, onClose, onSubmit, campaignTitle }: any) => {
  if (!isOpen) return null;
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Donar a: {campaignTitle}</Text>
        <Text style={{ color: "#fff", marginVertical: 10 }}>
          Aquí irá el formulario de donación.
        </Text>
        <TouchableOpacity
          onPress={() => {
            onSubmit(50);
            onClose();
          }}
          style={styles.modalButton}
        >
          <Text style={styles.modalButtonText}>Simular $50</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.modalButton, { backgroundColor: "#555" }]}
        >
          <Text style={styles.modalButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CampaignDetails() {
  // ➡️ Obtener el ID de los parámetros locales de la URL
  const { id } = useLocalSearchParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ⬅️ CRÍTICO: Reemplaza con tu IP local o usa 'localhost' si sigue funcionando
  const BASE_URL = "http://localhost:8080";

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/campaigns/${id}`);
        setCampaign(response.data);
      } catch (err) {
        setError("No se pudo cargar la campaña. Verifica el ID y el servidor.");
        console.error("Error fetching campaign details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleDonateSubmit = async (amount: number) => {
    if (!campaign) return null;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/campaigns/${campaign.id}/donations`,
        {
          amount,
          currency: campaign.currency || "USD", // Asegúrate de tener currency en el tipo Campaign
        }
      );
      alert(`Simulación de donación de $${amount} exitosa.`);
      return response.data;
    } catch (err) {
      console.error("Error creating donation request:", err);
      alert("Error al intentar donar.");
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
        <Text style={styles.loadingText}>Cargando campaña...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={30} color="#f87171" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Campaña no encontrada.</Text>
      </View>
    );
  }

  const progressPercentage = (campaign.amountRaised / campaign.goal) * 100;
  const safePercentage = Math.min(progressPercentage, 100);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>{campaign.title}</Text>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{campaign.description}</Text>
        </View>

        <View style={styles.progressBox}>
          <View style={styles.progressHeader}>
            <Text style={styles.raisedText}>
              ${campaign.amountRaised?.toLocaleString()}{" "}
              <Text style={styles.subText}>recaudados</Text>
            </Text>
            <Text style={styles.goalText}>
              Meta: ${campaign.goal?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${safePercentage}%` }]}
            />
          </View>
        </View>

        <View style={styles.donateContainer}>
          <TouchableOpacity
            onPress={() => setIsModalOpen(true)}
            style={styles.donateButton}
          >
            <Text style={styles.donateButtonText}>Donar ahora</Text>
          </TouchableOpacity>
          <Text style={styles.donateDisclaimer}>
            Las donaciones se procesan vía Open Payments.
          </Text>
        </View>
      </View>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleDonateSubmit}
        campaignTitle={campaign.title}
      />
    </ScrollView>
  );
}

// ------------------------------------------------------------------
// Estilos de React Native
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    minHeight: "100%",
    backgroundColor: "#1f2937", // Fondo similar a bg-gray-800 del original
  },
  card: {
    maxWidth: 800,
    alignSelf: "center",
    backgroundColor: "#1f2937", // bg-gray-800
    padding: 32, // p-8
    borderRadius: 12, // rounded-lg
  },
  title: {
    fontSize: 32, // text-4xl
    fontWeight: "bold",
    color: "#34d399", // text-teal-400
    marginBottom: 16, // mb-4
    textAlign: "center",
  },
  descriptionBox: {
    marginBottom: 24, // mb-6
  },
  descriptionText: {
    color: "#d1d5db", // text-gray-300
    lineHeight: 24,
    textAlign: "justify",
  },
  progressBox: {
    backgroundColor: "#374151", // bg-gray-700
    padding: 24, // p-6
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  raisedText: {
    fontWeight: "600",
    color: "white",
    fontSize: 18, // text-lg
  },
  subText: {
    fontSize: 14, // text-sm
    color: "#9ca3af", // text-gray-400
  },
  goalText: {
    fontSize: 14, // text-sm
    color: "#9ca3af", // text-gray-400
  },
  progressBarBackground: {
    backgroundColor: "#4b5563", // bg-gray-600
    borderRadius: 9999, // rounded-full
    height: 10,
  },
  progressBarFill: {
    backgroundColor: "#10b981", // bg-teal-500
    height: 10,
    borderRadius: 9999,
  },
  donateContainer: {
    marginTop: 32, // mt-8
    alignItems: "center",
  },
  donateButton: {
    backgroundColor: "#047857", // bg-teal-600
    paddingVertical: 12, // py-3
    paddingHorizontal: 40, // px-10
    borderRadius: 8, // rounded-lg
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  donateButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20, // text-xl
    textTransform: "uppercase",
  },
  donateDisclaimer: {
    fontSize: 12, // text-xs
    color: "#6b7280", // text-gray-500
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    color: "#9ca3af",
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: "rgba(127, 29, 29, 0.3)", // Simulación de bg-red-900/20
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    margin: 20,
  },
  errorText: {
    color: "#f87171",
    marginTop: 10,
  },
  notFoundContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  notFoundText: {
    color: "#9ca3af",
    fontSize: 18,
  },
  // --- Estilos para el Modal Temporal ---
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1f2937",
    padding: 25,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34d399",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#047857",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
