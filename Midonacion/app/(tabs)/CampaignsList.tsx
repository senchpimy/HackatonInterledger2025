import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions, // Se mantiene por si se usa en otro lado, pero no para el ancho de tarjetas
  SafeAreaView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

// Interfaz que coincide con la estructura de datos del backend de Go
interface Campaign {
  id: number;
  creatorUsername: string;
  title: string;
  description: string;
  goal: number;
  amountRaised: number;
  currency: string;
  paymentPointer: string;
  createdAt: string;
}

// ------------------------------------------------------------------
// Sub-Componente: CampaignCard (Tarjeta de Campaña)
// ------------------------------------------------------------------

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const percentage = Math.min(
    (campaign.amountRaised / campaign.goal) * 100,
    100
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardCategory}>AYUDA COMUNITARIA</Text>
        <Ionicons name="location-outline" size={14} color="#9ca3af" />
      </View>

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
              style={[styles.progressBarFill, { width: `${percentage}%` }]}
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

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.donateButton}>
            <Text style={styles.donateButtonText}>Ver y Donar</Text>
          </TouchableOpacity>
          <Text style={styles.userText}>
            @{campaign.creatorUsername || "anónimo"}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ------------------------------------------------------------------
// Sub-Componente: CampaignCardSkeleton (Carga)
// ------------------------------------------------------------------
// --- CAMBIO: Ya no necesita la prop `cardWidth` ---
const CampaignCardSkeleton = () => (
  <View style={styles.linkWrapper}>
    <View style={[styles.card, styles.skeletonContainer]}>
      <View
        style={[
          styles.skeletonLine,
          { width: "75%", height: 20, marginBottom: 16 },
        ]}
      />
      <View
        style={[
          styles.skeletonLine,
          { width: "100%", height: 14, marginBottom: 8 },
        ]}
      />
      <View
        style={[
          styles.skeletonLine,
          { width: "83%", height: 14, marginBottom: 24 },
        ]}
      />
      <View style={[styles.progressBarBackground, { marginBottom: 12 }]} />
      <View style={styles.progressDetails}>
        <View style={[styles.skeletonLine, { width: "25%", height: 16 }]} />
        <View style={[styles.skeletonLine, { width: "33%", height: 16 }]} />
      </View>
    </View>
  </View>
);

// ------------------------------------------------------------------
// Sub-Componente: StatisticsSection (Información de AIDLOOP)
// ------------------------------------------------------------------

const StatisticsSection = () => (
  <View style={statsStyles.statsContainer}>
    <View style={statsStyles.statBox}>
      <Ionicons name="leaf-outline" size={30} color="#34d399" />
      <Text style={statsStyles.statNumber}>100%</Text>
      <Text style={statsStyles.statLabel}>Transparencia</Text>
    </View>
    <View style={statsStyles.statBox}>
      <Ionicons name="git-network-outline" size={30} color="#60a5fa" />
      <Text style={statsStyles.statNumber}>Open</Text>
      <Text style={statsStyles.statLabel}>Payments</Text>
    </View>
    <View style={statsStyles.statBox}>
      <Ionicons name="heart-circle-outline" size={30} color="#f87171" />
      <Text style={statsStyles.statNumber}>420</Text>
      <Text style={statsStyles.statLabel}>Donadores Activos</Text>
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
  const router = useRouter();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response = await axios.get("http://localhost:8080/api/campaigns");
        setCampaigns(response.data || []);
      } catch (err) {
        setError(
          "No se pudieron cargar las campañas. Asegúrate de que el servidor backend esté funcionando (Error: 8080)."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // --- CAMBIO: Se eliminó toda la lógica de cálculo de columnas y ancho ---

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.listContainer}>
          {/* Renderiza 6 esqueletos de carga como placeholder */}
          {[...Array(6)].map((_, i) => (
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
            Parece que aún no se ha creado ninguna campaña. ¡Sé el primero!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/campaigns/CreateCampaign")}
          >
            <Text style={styles.createButtonText}>Crear Nueva Campaña</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {campaigns.map((campaign) => (
          // --- CAMBIO: Se simplificó el TouchableOpacity ---
          // Ahora usa el `linkWrapper` de la hoja de estilos, que contiene
          // las reglas de flexbox para un diseño responsivo.
          <Link href={`/campaigns/${campaign.id}`} key={campaign.id} asChild>
            <TouchableOpacity style={styles.linkWrapper}>
              <CampaignCard campaign={campaign} />
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mainHeader}>
          <Text style={styles.appTitle}>AIDLOOP</Text>
          <Text style={styles.headerSubtitle}>
            Donaciones transparentes y rastreables usando Interledger.
          </Text>
        </View>
        <StatisticsSection />
        <View style={styles.sectionSeparator} />
        <Text style={styles.sectionTitle}>
          {loading
            ? "Cargando Campañas..."
            : `Campañas Activas (${campaigns.length})`}
        </Text>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CampaignsList;

// ------------------------------------------------------------------
// Estilos de React Native
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  container: {
    padding: 20,
    minHeight: "100%",
  },
  mainHeader: {
    marginBottom: 30,
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#34d399",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 5,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Centra las tarjetas en el contenedor
  },
  // --- CAMBIO CLAVE: Estilos para el contenedor de la tarjeta ---
  linkWrapper: {
    flexGrow: 1, // Permite que el elemento crezca
    flexShrink: 1, // Permite que el elemento se encoja
    flexBasis: 300, // Ancho base ideal del elemento antes de crecer/encogerse
    minHeight: 250,
    margin: 10, // Espaciado simple y consistente alrededor de cada tarjeta
    maxWidth: "100%", // Asegura que en pantallas muy pequeñas no se desborde
  },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    textTransform: "uppercase",
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f3f4f6",
    marginBottom: 8,
  },
  cardDescription: {
    color: "#9ca3af",
    marginTop: 4,
    minHeight: 40,
  },
  progressContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  progressBarBackground: {
    backgroundColor: "#374151",
    borderRadius: 9999,
    height: 8,
    width: "100%",
  },
  progressBarFill: {
    backgroundColor: "#14b8a6",
    height: 8,
    borderRadius: 9999,
  },
  progressDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  raisedText: {
    fontWeight: "600",
    color: "#34d399",
    fontSize: 14,
  },
  goalText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  donateButton: {
    backgroundColor: "#059669",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  donateButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  userText: {
    color: "#60a5fa",
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "rgba(127, 29, 29, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#f87171",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  emptyContainer: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#d1d5db",
  },
  emptyDescription: {
    marginTop: 8,
    color: "#9ca3af",
    maxWidth: 350,
    textAlign: "center",
  },
  createButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0d9488",
    borderRadius: 6,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
  },
  skeletonContainer: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    padding: 16,
    minHeight: 250,
  },
  skeletonLine: {
    backgroundColor: "#374151",
    borderRadius: 4,
  },
});

// ------------------------------------------------------------------
// Estilos de la Sección de Estadísticas
// ------------------------------------------------------------------

const statsStyles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  statBox: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginTop: 2,
    textAlign: "center",
  },
});
