/* import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
 */

import React from "react";
// 🚨 Importante: Usar { Stack } de expo-router
import { Stack } from "expo-router";
// 🚨 La ruta al contexto debe ser correcta (asumimos que está en ./context/AuthContext)
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout() {
  return (
    // ⬅️ Envolver toda la aplicación con el proveedor de autenticación
    <AuthProvider>
      <Stack>
        {/*
          Rutas de Autenticación (Login, Register).
          Deben estar en la carpeta 'app/(auth)/'
        */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/*
          Rutas Principales (Pestañas).
          Deben estar en la carpeta 'app/(tabs)/'
        */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/*
          Puedes agregar otras rutas globales aquí, como un modal de error
        */}
      </Stack>
    </AuthProvider>
  );
}
