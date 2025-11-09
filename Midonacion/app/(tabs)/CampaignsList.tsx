import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Link } from "expo-router"; // Importamos Link desde expo-router
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import type { Campaign } from "../types";

const screenWidth = Dimensions.get("window").width;

// ------------------------------------------------------------------
// Sub-Componente: CampaignCard
// ------------------------------------------------------------------

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const percentage = Math.min(
    (campaign.amountRaised / campaign.goal) * 100,
    100
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {campaign.title}
        </Text>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {campaign.description}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percentage}%` }, // Aquí aplicamos el porcentaje
              ]}
            />
          </View>
          <View style={styles.progressDetails}>
            <Text style={styles.raisedText}>
              ${campaign.amountRaised.toLocaleString()}
            </Text>
            <Text style={styles.goalText}>
              Meta: ${campaign.goal.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ------------------------------------------------------------------
// Sub-Componente: CampaignCardSkeleton
// ------------------------------------------------------------------

const CampaignCardSkeleton = () => (
  <View style={[styles.card, styles.skeletonContainer]}>
    <View
      style={[
        styles.skeletonLine,
        { width: "75%", height: 24, marginBottom: 16 },
      ]}
    />
    <View
      style={[
        styles.skeletonLine,
        { width: "100%", height: 16, marginBottom: 8 },
      ]}
    />
    <View
      style={[
        styles.skeletonLine,
        { width: "83%", height: 16, marginBottom: 24 },
      ]}
    />
    <View style={[styles.progressBarBackground, { marginBottom: 12 }]} />
    <View style={styles.progressDetails}>
      <View style={[styles.skeletonLine, { width: "25%", height: 20 }]} />
      <View style={[styles.skeletonLine, { width: "33%", height: 16 }]} />
    </View>
  </View>
);

// ------------------------------------------------------------------
// Componente Principal: CampaignsList
// ------------------------------------------------------------------

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Simulación de latencia eliminada para un entorno nativo más rápido, pero mantenida para fines de prueba
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Nota: Asegúrate de que la URL de Axios sea correcta para tu entorno RN (ej: 'http://<IP_LOCAL>:8080/api/campaigns')
        const response = await axios.get("/api/campaigns");
        setCampaigns(response.data || []);
      } catch (err) {
        setError(
          "No se pudieron cargar las campañas. Asegúrate de que el servidor backend esté funcionando."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const renderContent = () => {
    if (loading) {
      // Nota: React Native no soporta 'grid-cols-3' nativamente.
      // Usamos un array de Views con un ancho calculado para simular las columnas.
      return (
        <View style={styles.listContainer}>
          {[...Array(3)].map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#f87171" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (campaigns.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No hay campañas activas</Text>
          <Text style={styles.emptyDescription}>
            Parece que aún no se ha creado ninguna campaña. ¿Por qué no eres el
            primero en iniciar una nueva causa?
          </Text>
          <Link
            href="/create" // Navegación usando Expo Router
            asChild
          >
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Crear Nueva Campaña</Text>
            </TouchableOpacity>
          </Link>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {campaigns.map((campaign) => (
          <Link
            href={`/campaigns/${campaign.id}`}
            key={campaign.id}
            asChild // Es importante usar 'asChild' cuando se envuelve otro componente (TouchableOpacity)
          >
            <TouchableOpacity style={styles.linkWrapper}>
              <CampaignCard campaign={campaign} />
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    );
  };

  return (
    // Usamos ScrollView para permitir el desplazamiento si hay muchas campañas
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Campañas Activas</Text>
      {renderContent()}
    </ScrollView>
  );
};

export default CampaignsList;

// ------------------------------------------------------------------
// Estilos de React Native (simulando Tailwind)
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    padding: 20,
    minHeight: "100%", // Asegura que se extienda para que el contenido centrado funcione
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    // Simulación del degradado (difícil en RN, se usa un color principal)
    color: "#34d399",
    marginBottom: 20,
    textAlign: "center",
  },
  // Contenedor de lista (simula un grid simple, para un grid real se necesitaría una librería)
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20, // Simulando el 'gap-8'
  },
  // Estilos de la tarjeta de campaña
  card: {
    backgroundColor: "rgba(31, 41, 55, 0.8)", // bg-gray-800/50
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)", // ring-1 ring-white/10
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Sombra para Android
    marginBottom: 20, // Espacio entre tarjetas
    width:
      screenWidth > 768
        ? screenWidth / 3 - 30
        : screenWidth > 480
        ? screenWidth / 2 - 30
        : screenWidth - 40,
    minHeight: 180,
  },
  cardContent: {
    padding: 16, // p-6
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 20, // text-xl
    fontWeight: "bold",
    color: "#f3f4f6", // text-gray-100
    marginBottom: 8,
  },
  cardDescription: {
    color: "#9ca3af", // text-gray-400
    marginTop: 8,
    // RN usa minHeight para simular line-clamp-2
    minHeight: 40,
  },
  progressContainer: {
    marginTop: 20, // mt-5
  },
  progressBarBackground: {
    backgroundColor: "#374151", // bg-gray-700
    borderRadius: 9999, // rounded-full
    height: 10, // h-2.5
    width: "100%",
  },
  progressBarFill: {
    // Para el degradado 'bg-gradient-to-r from-teal-500 to-cyan-500' en RN,
    // se recomienda usar una librería como `expo-linear-gradient` o un solo color.
    // Usaremos un solo color principal aquí.
    backgroundColor: "#14b8a6", // teal-500
    height: 10,
    borderRadius: 9999,
  },
  progressDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12, // mt-3
  },
  raisedText: {
    fontWeight: "600",
    color: "white",
    fontSize: 14, // text-sm
  },
  goalText: {
    color: "#9ca3af", // text-gray-400
    fontSize: 14, // text-sm
  },
  linkWrapper: {
    // Estilo para que el TouchableOpacity simule el 'block'
    width:
      screenWidth > 768
        ? screenWidth / 3 - 30
        : screenWidth > 480
        ? screenWidth / 2 - 30
        : screenWidth - 40,
  },
  // Estilos de Error
  errorContainer: {
    textAlign: "center",
    backgroundColor: "rgba(127, 29, 29, 0.3)", // bg-red-900/30
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)", // ring-1 ring-red-500/50
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#f87171", // text-red-400
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  // Estilos de Campañas Vacías
  emptyContainer: {
    textAlign: "center",
    backgroundColor: "rgba(31, 41, 55, 0.8)", // bg-gray-800/50
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)", // ring-1 ring-white/10
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d1d5db", // text-gray-300
  },
  emptyDescription: {
    marginTop: 8,
    color: "#9ca3af", // text-gray-400
    maxWidth: 350,
    textAlign: "center",
  },
  createButton: {
    marginTop: 24,
    paddingHorizontal: 24, // px-6
    paddingVertical: 12, // py-3
    backgroundColor: "#0d9488", // bg-teal-600
    borderRadius: 6, // rounded-md
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
  },
  // Estilos del Skeleton
  skeletonContainer: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    padding: 16,
    minHeight: 180,
  },
  skeletonLine: {
    backgroundColor: "#374151", // bg-gray-700
    borderRadius: 4,
  },
});
