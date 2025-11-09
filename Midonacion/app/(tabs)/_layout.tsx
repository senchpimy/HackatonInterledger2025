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
      {/* 1. INICIO (Mapeado a index.tsx) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. USUARIO (Mapeado a user.tsx) */}
      <Tabs.Screen
        name="user"
        options={{
          title: "Usuario",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      {/* 3. CREAR CAMPAÑA (Mapeado a create-support.tsx) */}
      <Tabs.Screen
        name="create-support" // 🚨 CORREGIDO: Debe ser el nombre del archivo (create-support.tsx)
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

      {/* 5. GRUPO DE CAMPAÑAS (Contiene la lista y los detalles) */}
      {/*
        Esto mapea a la carpeta 'app/(tabs)/campaigns/'. 
        Al ser una carpeta, solo sirve como contenedor y no aparece como pestaña,
        a menos que tenga un archivo 'campaigns/index.tsx'.
        Si tu lista está en index.tsx, no necesitas esta carpeta como pestaña.
      */}
      <Tabs.Screen
        name="campaigns" // 🚨 Ajusta el nombre si tienes la lista aquí (campaigns/index.tsx)
        options={{
          title: "Campañas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />

      {/* 6. DETALLES DE CAMPAÑA (Ruta Dinámica) */}
      {/*
        El layout busca la ruta dinámica: app/(tabs)/campaigns/[id].tsx
        Al ser un detalle, se OCULTA de la barra de pestañas.
      */}
      <Tabs.Screen
        // 🚨 La ruta dinámica debe ir dentro de la carpeta 'campaigns/'
        name="campaigns/[id]"
        options={{
          href: null, // 🚨 Oculta esta ruta de la barra de pestañas
          title: "Detalles de Campaña",
        }}
      />
    </Tabs>
  );
}
