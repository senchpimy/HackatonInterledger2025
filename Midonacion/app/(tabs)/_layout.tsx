import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons"; // Usaremos iconos de Ionicons

export default function TabLayout() {
  return (
    // Componente Tabs del Expo Router
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF", // Color del icono activo
        headerShown: false, // Oculta el encabezado en las pestañas
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
        name="c"
        options={{
          title: "Usuario",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      {/* 3. CREAR APOYO (Mapeado a create-support.tsx) */}
      <Tabs.Screen
        name="create-support"
        options={{
          title: "Crear Apoyo",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={24} color={color} />
          ),
        }}
      />

      {/* 4. VALIDAR (Mapeado a validate.tsx) */}
      <Tabs.Screen
        name="validate"
        options={{
          title: "Validar",
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkmark-circle" size={24} color={color} />
          ),
        }}
      />

      {/* 5. VER QUE TE HAN DONADO (Mapeado a received-donations.tsx) */}
      <Tabs.Screen
        name="received-donations"
        options={{
          title: "Mis Donaciones",
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={24} color={color} />
          ),
        }}
      />

      {/* 6. VER OTRAS DONACIONES (Mapeado a other-donations.tsx) */}
      <Tabs.Screen
        name="other-donations"
        options={{
          title: "Ver Donaciones",
          tabBarIcon: ({ color }) => (
            <Ionicons name="gift" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
