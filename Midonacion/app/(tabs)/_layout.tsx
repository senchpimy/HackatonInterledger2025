import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons"; // Usaremos iconos de Ionicons

export default function TabLayout() {
  return (
    // Componente Tabs del Expo Router
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        headerShown: false,
        // Si quieres el encabezado, usa: headerShown: true
      }}
    >
      {/* 1. INICIO (Mapeado a index.tsx) */}
      <Tabs.Screen
        name="index" // Debe coincidir con el nombre de archivo (index.tsx)
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. USUARIO (Mapeado a user.tsx) */}
      <Tabs.Screen
        name="user" // Corregido: asumí que debería ser "user"
        options={{
          title: "Usuario",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      {/* 3. LISTA DE CAMPAÑAS (CampaignsList.tsx) */}
      <Tabs.Screen
        name="CampaignsList" // Nombre del archivo CampaignsList.tsx
        options={{
          title: "Campañas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />

      {/* 4. CREAR CAMPAÑA (CreateCampaign.tsx) */}
      <Tabs.Screen
        name="CreateCampaign" // Nombre del archivo CreateCampaign.tsx
        options={{
          title: "Crear",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={24} color={color} />
          ),
        }}
      />

      {/* 5. DETALLES DE CAMPAÑA (CampaignDetails.tsx) - Oculta la pestaña */}
      <Tabs.Screen
        name="CampaignDetails" // Nombre del archivo CampaignDetails.tsx
        options={{
          // Este es un detalle, lo ocultamos de la barra de pestañas principal
          href: null,
          title: "Detalles",
          // Puedes dejar o quitar el icono si está oculto
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
