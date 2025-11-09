import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#34d399", // Color activo de la app
        headerShown: false, // Ocultar el encabezado por defecto
        tabBarStyle: {
          backgroundColor: "#1f2937", // Fondo oscuro para las pestañas
          borderTopColor: "#374151",
        },
      }}
    >
      {/* 1. INICIO (Mapeado a index.tsx, que es la lista de campañas) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Campañas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />

      {/* 2. CREAR CAMPAÑA (Mapeado a campaigns/CreateCampaign.tsx) */}
      <Tabs.Screen
        name="campaigns/CreateCampaign"
        options={{
          title: "Crear",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={24} color={color} />
          ),
        }}
      />

      {/* 3. USUARIO (Mapeado a user.tsx) */}
      <Tabs.Screen
        name="user"
        options={{
          title: "Usuario",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      {/* RUTA DE DETALLES DE CAMPAÑA (OCULTA) */}
      <Tabs.Screen
        name="campaigns/[id]"
        options={{
          href: null, // Oculta esta ruta de la barra de pestañas
          title: "Detalles de Campaña",
        }}
      />
    </Tabs>
  );
}
